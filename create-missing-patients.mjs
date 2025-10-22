#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api.js';

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || 'https://tangible-anteater-301.convex.cloud');

console.log('🔧 Creating missing patients and importing their files...');
console.log(`📡 Using Convex URL: ${process.env.VITE_CONVEX_URL || 'https://tangible-anteater-301.convex.cloud'}`);

// Add delay between requests to avoid overwhelming the server
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getAllPatients() {
  console.log('📋 Fetching existing patients...');
  try {
    const patients = await convex.query(api.patients.list);
    console.log(`✅ Found ${patients.length} existing patients in database`);
    return patients;
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    return [];
  }
}

function parseNameFromFolder(folderName) {
  // Extract name from folder format: CID_Firstname_Lastname
  const match = folderName.match(/^(\d+)_(.+)$/);
  if (!match) return null;
  
  const [, cid, namepart] = match;
  
  // Replace underscores with spaces and clean up
  let fullName = namepart.replace(/_/g, ' ').trim();
  
  // Remove asterisks and clean special characters
  fullName = fullName.replace(/\*/g, '').trim();
  
  // Handle special cases like parentheses
  fullName = fullName.replace(/\([^)]*\)/g, '').trim();
  
  return {
    cid: cid,
    name: fullName,
    // Try to split first/last name
    firstName: fullName.split(' ')[0] || '',
    lastName: fullName.split(' ').slice(1).join(' ') || ''
  };
}

async function extractMissingPatientsFromFolders() {
  console.log('🔍 Extracting missing patients from photo and payment folders...');
  
  const missingPatients = new Map();
  
  // Check photo folders
  try {
    const photoFolders = await fs.readdir('client_photos');
    console.log(`📁 Found ${photoFolders.length} photo folders`);
    
    for (const folder of photoFolders) {
      const parsed = parseNameFromFolder(folder);
      if (parsed) {
        missingPatients.set(parsed.cid, parsed);
      }
    }
  } catch (error) {
    console.log('⚠️ Could not read client_photos directory:', error.message);
  }
  
  // Check payment folders
  try {
    const paymentFolders = await fs.readdir('payment_history');
    console.log(`📁 Found ${paymentFolders.length} payment folders`);
    
    for (const folder of paymentFolders) {
      const parsed = parseNameFromFolder(folder);
      if (parsed) {
        // If we already have this CID from photos, keep the existing entry
        if (!missingPatients.has(parsed.cid)) {
          missingPatients.set(parsed.cid, parsed);
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Could not read payment_history directory:', error.message);
  }
  
  return Array.from(missingPatients.values());
}

async function filterExistingPatients(candidatePatients, existingPatients) {
  console.log('🔍 Filtering out patients that already exist...');
  
  // Create a set of existing CIDs for quick lookup
  const existingCids = new Set();
  existingPatients.forEach(patient => {
    if (patient.cid) {
      existingCids.add(patient.cid);
    }
  });
  
  const missingPatients = candidatePatients.filter(candidate => {
    return !existingCids.has(candidate.cid);
  });
  
  console.log(`✅ Found ${missingPatients.length} patients that need to be created`);
  return missingPatients;
}

async function createPatient(patientData) {
  try {
    console.log(`➕ Creating patient: ${patientData.name} (CID: ${patientData.cid})`);
    
    // First create the patient with basic required fields
    const newPatientId = await convex.mutation(api.patients.create, {
      name: patientData.name,
      dateOfBirth: '', // We don't have this info from folder names
      email: '', // We don't have this info
      phone: '', // We don't have this info  
    });
    
    // Then update with additional fields like CID
    await convex.mutation(api.patients.update, {
      id: newPatientId,
      cid: patientData.cid,
      firstName: patientData.firstName,
      lastName: patientData.lastName,
    });
    
    console.log(`✅ Created patient: ${patientData.name} with ID: ${newPatientId}`);
    return newPatientId;
  } catch (error) {
    console.error(`❌ Error creating patient ${patientData.name}:`, error);
    return null;
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

async function uploadFileToConvex(filePath, fileName, uploadType = 'photo') {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const file = new File([fileBuffer], fileName, {
      type: getContentType(fileName)
    });
    
    // Generate upload URL based on type
    let postUrl;
    if (uploadType === 'photo') {
      postUrl = await convex.mutation(api.photos.generateUploadUrl);
    } else {
      postUrl = await convex.mutation(api.miscFiles.generateUploadUrl);
    }
    
    // Upload file
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    
    if (!result.ok) {
      throw new Error(`Upload failed: ${result.statusText}`);
    }
    
    const { storageId } = await result.json();
    return storageId;
  } catch (error) {
    console.error(`❌ Error uploading ${uploadType} ${fileName}:`, error);
    return null;
  }
}

async function importPhotosForPatient(patientId, cid, patientName) {
  const photoFolderPath = path.join('client_photos', `${cid}_${patientName.replace(/ /g, '_')}`);
  
  try {
    // Try different folder name variations
    let folders = await fs.readdir('client_photos');
    const matchingFolder = folders.find(folder => folder.startsWith(`${cid}_`));
    
    if (!matchingFolder) {
      console.log(`📷 No photo folder found for ${patientName} (CID: ${cid})`);
      return 0;
    }
    
    const folderPath = path.join('client_photos', matchingFolder);
    const files = await fs.readdir(folderPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif)$/i.test(file)
    );
    
    console.log(`📷 Found ${imageFiles.length} photos for ${patientName}`);
    
    let uploadedCount = 0;
    for (const file of imageFiles) {
      const filePath = path.join(folderPath, file);
      
      console.log(`📤 Uploading photo: ${file} for ${patientName}`);
      const storageId = await uploadFileToConvex(filePath, file, 'photo');
      
      if (storageId) {
        // Extract date from filename if possible
        const dateMatch = file.match(/(\d{2}-\d{2}-\d{4})/);
        const photoDate = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('en-CA');
        
        await convex.mutation(api.photos.create, {
          patientId: patientId,
          date: photoDate,
          description: `Photo from import: ${file}`,
          storageId: storageId
        });
        
        uploadedCount++;
        console.log(`✅ Added photo ${file} for ${patientName}`);
        
        // Small delay to prevent overwhelming
        await delay(50);
      }
    }
    
    return uploadedCount;
  } catch (error) {
    console.error(`❌ Error importing photos for ${patientName}:`, error);
    return 0;
  }
}

async function importPaymentsForPatient(patientId, cid, patientName) {
  try {
    // Try different folder name variations
    let folders = await fs.readdir('payment_history');
    const matchingFolder = folders.find(folder => folder.startsWith(`${cid}_`));
    
    if (!matchingFolder) {
      console.log(`💰 No payment folder found for ${patientName} (CID: ${cid})`);
      return 0;
    }
    
    const folderPath = path.join('payment_history', matchingFolder);
    const files = await fs.readdir(folderPath);
    const pdfFiles = files.filter(file => 
      path.extname(file).toLowerCase() === '.pdf'
    );
    
    console.log(`💰 Found ${pdfFiles.length} payment files for ${patientName}`);
    
    let uploadedCount = 0;
    for (const file of pdfFiles) {
      const filePath = path.join(folderPath, file);
      
      console.log(`📤 Uploading payment file: ${file} for ${patientName}`);
      const storageId = await uploadFileToConvex(filePath, file, 'misc');
      
      if (storageId) {
        await convex.mutation(api.miscFiles.create, {
          patientId: patientId,
          fileName: file,
          fileType: 'application/pdf',
          description: `Payment history document`,
          category: 'payment',
          storageId: storageId
        });
        
        uploadedCount++;
        console.log(`✅ Added payment file ${file} for ${patientName}`);
        
        // Small delay to prevent overwhelming
        await delay(50);
      }
    }
    
    return uploadedCount;
  } catch (error) {
    console.error(`❌ Error importing payments for ${patientName}:`, error);
    return 0;
  }
}

async function main() {
  console.log('🚀 Starting missing patient creation and file import...');
  
  const existingPatients = await getAllPatients();
  const candidatePatients = await extractMissingPatientsFromFolders();
  const missingPatients = await filterExistingPatients(candidatePatients, existingPatients);
  
  if (missingPatients.length === 0) {
    console.log('✅ No missing patients found. All patients already exist!');
    return;
  }
  
  console.log(`🎯 Will create ${missingPatients.length} missing patients and import their files`);
  
  let createdCount = 0;
  let totalPhotos = 0;
  let totalPayments = 0;
  
  for (const missingPatient of missingPatients) {
    try {
      // Create the patient
      const patientId = await createPatient(missingPatient);
      
      if (patientId) {
        createdCount++;
        
        // Import photos for this patient
        const photoCount = await importPhotosForPatient(
          patientId, 
          missingPatient.cid, 
          missingPatient.name
        );
        totalPhotos += photoCount;
        
        // Import payments for this patient
        const paymentCount = await importPaymentsForPatient(
          patientId, 
          missingPatient.cid, 
          missingPatient.name
        );
        totalPayments += paymentCount;
        
        console.log(`✅ Completed ${missingPatient.name}: ${photoCount} photos, ${paymentCount} payments`);
        
        // Progress update every 10 patients
        if (createdCount % 10 === 0) {
          console.log(`📊 Progress: ${createdCount}/${missingPatients.length} patients created`);
        }
        
        // Delay between patients to prevent overwhelming the server
        await delay(200);
      }
    } catch (error) {
      console.error(`❌ Error processing patient ${missingPatient.name}:`, error);
    }
  }
  
  console.log('🎉 Missing patient creation and import completed!');
  console.log(`📊 Final Results:`);
  console.log(`   • ${createdCount} patients created`);
  console.log(`   • ${totalPhotos} photos imported`);
  console.log(`   • ${totalPayments} payment files imported`);
}

main().catch(console.error);
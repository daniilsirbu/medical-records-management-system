#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api.js';

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || 'https://tangible-anteater-301.convex.cloud');

console.log('🔧 Resuming payment history import...');
console.log(`📡 Using Convex URL: ${process.env.VITE_CONVEX_URL || 'https://tangible-anteater-301.convex.cloud'}`);

// Add delay between requests to avoid overwhelming the server
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function getAllPatients() {
  console.log('📋 Fetching all patients...');
  try {
    const patients = await convex.query(api.patients.list);
    console.log(`✅ Found ${patients.length} patients in database`);
    return patients;
  } catch (error) {
    console.error('❌ Error fetching patients:', error);
    return [];
  }
}

async function getExistingMiscFiles() {
  console.log('📋 Fetching existing misc files to avoid duplicates...');
  try {
    // This is a simplified approach - we'll check for duplicates when uploading
    return new Set();
  } catch (error) {
    console.error('❌ Error fetching existing files:', error);
    return new Set();
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

async function uploadMiscFileToConvex(filePath, fileName, retryCount = 0) {
  const maxRetries = 3;
  try {
    const fileBuffer = await fs.readFile(filePath);
    const file = new File([fileBuffer], fileName, {
      type: getContentType(fileName)
    });
    
    // Generate upload URL with retry
    const postUrl = await convex.mutation(api.miscFiles.generateUploadUrl);
    
    // Upload file with timeout
    const uploadPromise = fetch(postUrl, {
      method: 'POST',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout')), 30000)
    );
    
    const result = await Promise.race([uploadPromise, timeoutPromise]);
    
    if (!result.ok) {
      throw new Error(`Upload failed: ${result.statusText}`);
    }
    
    const { storageId } = await result.json();
    return storageId;
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying upload for ${fileName} (attempt ${retryCount + 1}/${maxRetries})`);
      await delay(2000); // Wait 2 seconds before retry
      return uploadMiscFileToConvex(filePath, fileName, retryCount + 1);
    }
    console.error(`❌ Error uploading misc file ${fileName}:`, error);
    return null;
  }
}

async function processPaymentHistory(patients) {
  console.log('💰 Processing payment history...');
  const paymentDir = 'payment_history';
  
  try {
    const folders = await fs.readdir(paymentDir);
    console.log(`📁 Found ${folders.length} payment folders`);
    
    let filesUploaded = 0;
    let foldersProcessed = 0;
    let skippedFiles = 0;
    
    // Create a map for faster patient lookup
    const patientMap = new Map();
    patients.forEach(patient => {
      if (patient.cid) {
        patientMap.set(patient.cid, patient);
      }
    });
    
    for (const folder of folders) {
      foldersProcessed++;
      
      // Extract CID from folder name (format: CID_Firstname_Lastname)
      const cidMatch = folder.match(/^(\d+)_/);
      if (!cidMatch) {
        console.log(`⚠️  Skipping folder with invalid format: ${folder}`);
        continue;
      }
      
      const cid = cidMatch[1];
      const patient = patientMap.get(cid);
      
      if (!patient) {
        console.log(`⚠️  Patient not found for CID: ${cid} (${folder})`);
        continue;
      }
      
      const folderPath = path.join(paymentDir, folder);
      let files;
      
      try {
        files = await fs.readdir(folderPath);
      } catch (error) {
        console.log(`⚠️  Cannot read folder ${folder}:`, error.message);
        continue;
      }
      
      const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
      
      if (pdfFiles.length === 0) {
        continue;
      }
      
      for (const file of pdfFiles) {
        const filePath = path.join(folderPath, file);
        
        try {
          // Check if file already exists by querying the patient's misc files
          const existingFiles = await convex.query(api.miscFiles.list, { patientId: patient._id });
          const fileAlreadyExists = existingFiles.some(existingFile => 
            existingFile.fileName === file
          );
          
          if (fileAlreadyExists) {
            console.log(`⏭️  File already exists, skipping: ${file}`);
            skippedFiles++;
            continue;
          }
          
          console.log(`📤 Uploading payment file: ${file} for ${patient.name}`);
          
          const storageId = await uploadMiscFileToConvex(filePath, file);
          
          if (storageId) {
            // Create misc file record
            await convex.mutation(api.miscFiles.create, {
              patientId: patient._id,
              fileName: file,
              fileType: 'application/pdf',
              description: `Payment history document`,
              category: 'payment',
              storageId: storageId
            });
            
            filesUploaded++;
            console.log(`✅ Added payment file ${file} for ${patient.name}`);
            
            // Add delay between uploads to prevent overwhelming the server
            await delay(100);
          }
        } catch (error) {
          console.error(`❌ Error processing file ${file}:`, error);
        }
      }
      
      // Progress update every 50 folders
      if (foldersProcessed % 50 === 0) {
        console.log(`📊 Progress: ${foldersProcessed}/${folders.length} folders processed, ${filesUploaded} files uploaded, ${skippedFiles} skipped`);
      }
    }
    
    console.log(`✅ Payment history complete: ${filesUploaded} files uploaded, ${skippedFiles} skipped from ${folders.length} folders`);
    
  } catch (error) {
    console.error('❌ Error processing payment history:', error);
  }
}

async function main() {
  console.log('🚀 Starting resume import process...');
  
  const patients = await getAllPatients();
  if (patients.length === 0) {
    console.log('❌ No patients found. Exiting.');
    return;
  }
  
  await processPaymentHistory(patients);
  
  console.log('🎉 Resume import process completed!');
}

main().catch(console.error);
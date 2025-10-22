#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api.js';

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.VITE_CONVEX_URL || 'https://tangible-anteater-301.convex.cloud');

console.log('🔧 Starting file import process...');

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

async function uploadPhotoToConvex(filePath, fileName) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const file = new File([fileBuffer], fileName, {
      type: getContentType(fileName)
    });
    
    // Generate upload URL
    const postUrl = await convex.mutation(api.photos.generateUploadUrl);
    
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
    console.error(`❌ Error uploading photo ${fileName}:`, error);
    return null;
  }
}

async function uploadMiscFileToConvex(filePath, fileName) {
  try {
    const fileBuffer = await fs.readFile(filePath);
    const file = new File([fileBuffer], fileName, {
      type: getContentType(fileName)
    });
    
    // Generate upload URL
    const postUrl = await convex.mutation(api.miscFiles.generateUploadUrl);
    
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
    console.error(`❌ Error uploading misc file ${fileName}:`, error);
    return null;
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

async function processClientPhotos(patients) {
  console.log('📷 Processing client photos...');
  const photosDir = './client_photos';
  
  try {
    const folders = await fs.readdir(photosDir);
    console.log(`📁 Found ${folders.length} photo folders`);
    
    let processedCount = 0;
    let photoCount = 0;
    
    for (const folder of folders) {
      try {
        // Parse folder name: CID_Firstname_Lastname
        const parts = folder.split('_');
        if (parts.length < 3) continue;
        
        const cid = parts[0];
        const firstName = parts[1];
        const lastName = parts.slice(2).join('_');
        
        // Find patient by CID
        const patient = patients.find(p => p.cid === cid);
        if (!patient) {
          console.log(`⚠️  Patient not found for CID: ${cid} (${firstName} ${lastName})`);
          continue;
        }
        
        const folderPath = path.join(photosDir, folder);
        const files = await fs.readdir(folderPath);
        
        for (const file of files) {
          if (file.startsWith('.')) continue; // Skip hidden files
          
          const filePath = path.join(folderPath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            console.log(`📤 Uploading photo: ${file} for ${patient.name}`);
            
            const storageId = await uploadPhotoToConvex(filePath, file);
            if (storageId) {
              // Add photo to database
              await convex.mutation(api.photos.create, {
                patientId: patient._id,
                date: new Date().toISOString().split('T')[0],
                description: `Photo for ${patient.name}`,
                storageId: storageId
              });
              
              photoCount++;
              console.log(`✅ Added photo ${file} for ${patient.name}`);
            }
          }
        }
        
        processedCount++;
        if (processedCount % 50 === 0) {
          console.log(`📊 Progress: ${processedCount}/${folders.length} folders processed, ${photoCount} photos uploaded`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing folder ${folder}:`, error);
      }
    }
    
    console.log(`✅ Photos complete: ${photoCount} photos uploaded from ${processedCount} folders`);
    
  } catch (error) {
    console.error('❌ Error processing client photos:', error);
  }
}

async function processPaymentHistory(patients) {
  console.log('💰 Processing payment history...');
  const paymentsDir = './payment_history';
  
  try {
    const folders = await fs.readdir(paymentsDir);
    console.log(`📁 Found ${folders.length} payment folders`);
    
    let processedCount = 0;
    let fileCount = 0;
    
    for (const folder of folders) {
      try {
        // Parse folder name: CID_Firstname_Lastname
        const parts = folder.split('_');
        if (parts.length < 3) continue;
        
        const cid = parts[0];
        const firstName = parts[1];
        const lastName = parts.slice(2).join('_');
        
        // Find patient by CID
        const patient = patients.find(p => p.cid === cid);
        if (!patient) {
          console.log(`⚠️  Patient not found for CID: ${cid} (${firstName} ${lastName})`);
          continue;
        }
        
        const folderPath = path.join(paymentsDir, folder);
        const files = await fs.readdir(folderPath);
        
        for (const file of files) {
          if (file.startsWith('.')) continue; // Skip hidden files
          
          const filePath = path.join(folderPath, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            console.log(`📤 Uploading payment file: ${file} for ${patient.name}`);
            
            const storageId = await uploadMiscFileToConvex(filePath, file);
            if (storageId) {
              // Add to miscFiles table
              await convex.mutation(api.miscFiles.create, {
                patientId: patient._id,
                fileName: file,
                fileType: 'payment_history',
                description: `Payment history for ${patient.name}`,
                category: 'payment',
                storageId: storageId
              });
              
              fileCount++;
              console.log(`✅ Added payment file ${file} for ${patient.name}`);
            }
          }
        }
        
        processedCount++;
        if (processedCount % 50 === 0) {
          console.log(`📊 Progress: ${processedCount}/${folders.length} folders processed, ${fileCount} files uploaded`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing folder ${folder}:`, error);
      }
    }
    
    console.log(`✅ Payment history complete: ${fileCount} files uploaded from ${processedCount} folders`);
    
  } catch (error) {
    console.error('❌ Error processing payment history:', error);
  }
}

async function main() {
  try {
    console.log('🚀 Starting import process...');
    console.log(`📡 Using Convex URL: ${process.env.VITE_CONVEX_URL || 'https://tangible-anteater-301.convex.cloud'}`);
    
    // Get all patients first
    const patients = await getAllPatients();
    if (patients.length === 0) {
      console.error('❌ No patients found in database');
      return;
    }
    
    // Process photos
    await processClientPhotos(patients);
    
    // Process payment history
    await processPaymentHistory(patients);
    
    console.log('🎉 Import process completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();
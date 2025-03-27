import fs from 'fs';
import path from 'path';
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

interface FileData {
  buffer: Buffer | Uint8Array;
  filename: string;
  mimetype?: string;
  encoding?: string;
}

/**
 * Save an uploaded file to the uploads directory
 * @param file - The file data (from multer or similar middleware)
 * @param subdirectory - Optional subdirectory within uploads folder
 * @returns The relative path to the saved file
 */
export async function saveUploadedFile(fileData: FileData, subdirectory: string): Promise<string> {
  // Generate a unique filename to avoid collisions
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExt = fileData.filename.split('.').pop() || 'bin';
  const safeFilename = `${timestamp}-${randomString}.${fileExt}`;
  
  // In a real app, we would:
  // 1. Create the subdirectory if it doesn't exist
  // 2. Write the file to disk
  // 3. Return the path to the file
  
  // For our mock, we'll just generate a file path
  const filePath = `/uploads/${subdirectory}/${safeFilename}`;
  
  console.log(`Mock file saved: ${filePath} (${fileData.buffer.byteLength} bytes)`);
  
  return filePath;
}

/**
 * Delete a file from the uploads directory
 * @param filePath - The relative path to the file
 * @returns True if the file was deleted, false otherwise
 */
export async function deleteUploadedFile(filePath: string): Promise<boolean> {
  // In a real app, we would:
  // 1. Verify the file exists
  // 2. Delete the file from disk
  // 3. Return success/failure
  
  console.log(`Mock file deleted: ${filePath}`);
  
  return true;
}

/**
 * Get array of attachments from attachment string stored in database
 * @param attachmentsString - JSON string representation of attachments
 * @returns Array of attachment paths
 */
export function parseAttachments(attachmentsJson: string | null | undefined): string[] {
  if (!attachmentsJson) return [];
  
  try {
    return JSON.parse(attachmentsJson);
  } catch (error) {
    console.error('Error parsing attachments JSON:', error);
    return [];
  }
}

/**
 * Convert array of attachment paths to JSON string for storage
 * @param attachments - Array of attachment paths
 * @returns JSON string representation of attachments
 */
export function stringifyAttachments(attachments: string[]): string {
  return JSON.stringify(attachments);
} 
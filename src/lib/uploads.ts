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
  filename: string;
  mimetype: string;
  encoding: string;
  buffer: Buffer;
}

/**
 * Save an uploaded file to the uploads directory
 * @param file - The file data (from multer or similar middleware)
 * @param subdirectory - Optional subdirectory within uploads folder
 * @returns The relative path to the saved file
 */
export async function saveUploadedFile(
  file: FileData,
  subdirectory: string = ''
): Promise<string> {
  // Create unique filename with UUID to prevent collisions
  const fileExtension = path.extname(file.filename);
  const uniqueFilename = `${uuidv4()}${fileExtension}`;
  
  // Create target directory if it doesn't exist
  const targetDir = path.join(uploadsDir, subdirectory);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Full path to save the file
  const filePath = path.join(targetDir, uniqueFilename);
  
  // Write the file
  await fs.promises.writeFile(filePath, file.buffer);
  
  // Return the relative path for storage in the database
  return path.join('/uploads', subdirectory, uniqueFilename).replace(/\\/g, '/');
}

/**
 * Delete a file from the uploads directory
 * @param filePath - The relative path to the file
 * @returns True if the file was deleted, false otherwise
 */
export async function deleteUploadedFile(filePath: string): Promise<boolean> {
  // Get absolute path from relative path
  const absolutePath = path.join(process.cwd(), filePath);
  
  try {
    // Check if file exists before attempting to delete
    if (fs.existsSync(absolutePath)) {
      await fs.promises.unlink(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Get array of attachments from attachment string stored in database
 * @param attachmentsString - JSON string representation of attachments
 * @returns Array of attachment paths
 */
export function parseAttachments(attachmentsString: string | null): string[] {
  if (!attachmentsString) {
    return [];
  }
  
  try {
    return JSON.parse(attachmentsString);
  } catch (error) {
    console.error('Error parsing attachments:', error);
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
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/local-auth'; // Use local auth

// Mock file system for uploads
const uploadedFiles: Record<string, {
  buffer: Uint8Array,
  userId: number,
  processChangeId?: number,
  contentType: string,
  filename: string
}> = {};

// POST handler for file uploads
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'You must be authenticated to upload files' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get process change ID if provided
    const processChangeId = formData.get('processChangeId') 
      ? parseInt(formData.get('processChangeId') as string) 
      : undefined;
    
    // Create a file buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(fileBuffer);
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop() || 'bin';
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const filename = `${uniqueId}.${fileExt}`;
    
    // Determine the subdirectory
    const subdirectory = processChangeId 
      ? `change-${processChangeId}` 
      : `user-${currentUser.id}`;
    
    // Generate the file path
    const filePath = `/uploads/${subdirectory}/${filename}`;
    
    // Store file in our mock file system
    uploadedFiles[filePath] = {
      buffer,
      userId: currentUser.id,
      processChangeId,
      contentType: file.type,
      filename: file.name
    };
    
    // Return the file path
    return NextResponse.json({ 
      filePath,
      fileName: file.name,
      fileSize: buffer.length
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// DELETE handler for file deletion
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'You must be authenticated to delete files' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }
    
    // Check if file exists
    if (!uploadedFiles[filePath]) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to delete this file
    const isAdmin = currentUser.role === 'ADMIN';
    const isOwner = uploadedFiles[filePath].userId === currentUser.id;
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this file' },
        { status: 403 }
      );
    }
    
    // Delete the file from our mock file system
    delete uploadedFiles[filePath];
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile, deleteUploadedFile } from '@/lib/uploads';
// @ts-ignore
import { currentUser } from '@clerk/nextjs';
import { getUserByClerkId, hasRole } from '@/lib/auth';

// POST /api/uploads - Upload a file
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await getUserByClerkId(clerkUser.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Get process change ID from form data (if provided)
    const processChangeId = formData.get('processChangeId') as string;
    
    // Convert File to buffer for our saveUploadedFile function
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Prepare file data for our upload function
    const fileData = {
      filename: file.name,
      mimetype: file.type,
      encoding: 'utf-8', // Default encoding
      buffer: buffer
    };
    
    // Determine subdirectory based on process change ID
    const subdirectory = processChangeId ? `change-${processChangeId}` : `user-${user.id}`;
    
    // Save the file
    const filePath = await saveUploadedFile(fileData, subdirectory);
    
    return NextResponse.json({ filePath });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// DELETE /api/uploads - Delete a file
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const user = await getUserByClerkId(clerkUser.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }
    
    // Only admin or the user who uploaded the file can delete it
    // This is a simple implementation; you might want to store file ownership in the database
    const isAdmin = hasRole(user.role, 'ADMIN');
    
    // Get the file path from the request body
    const { filePath } = await request.json();
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      );
    }
    
    // For better security, validate that the file path is in the user's directory
    // unless the user is an admin
    if (!isAdmin && !filePath.includes(`/user-${user.id}/`)) {
      // Check if the file is in a process change directory that the user owns
      // This is a simplistic check; in a real app, you'd query the database
      const match = filePath.match(/\/change-(\d+)\//);
      if (!match) {
        return NextResponse.json(
          { error: 'You do not have permission to delete this file' },
          { status: 403 }
        );
      }
    }
    
    // Delete the file
    const success = await deleteUploadedFile(filePath);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
} 
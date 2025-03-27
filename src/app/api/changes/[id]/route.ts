import { NextRequest, NextResponse } from 'next/server';
import { 
  getProcessChangeById, 
  updateProcessChange, 
  deleteProcessChange
} from '@/lib/db/mock-data'; // Use mock data instead of SQLite
import { ProcessStatus } from '@/lib/db/process-changes';
import { getCurrentUser, hasRole } from '@/lib/local-auth'; // Use local auth

// GET handler to fetch a specific process change
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Check if ID is a valid number
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Get the process change
    const processChange = getProcessChangeById(id);
    
    // Check if process change exists
    if (!processChange) {
      return NextResponse.json(
        { error: 'Process change not found' },
        { status: 404 }
      );
    }
    
    // Return the process change
    return NextResponse.json(processChange);
  } catch (error) {
    console.error('Error fetching process change:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process change' },
      { status: 500 }
    );
  }
}

// PATCH handler to update a process change
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id);
    
    // Check if ID is a valid number
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Get the existing process change
    const processChange = getProcessChangeById(id);
    
    // Check if process change exists
    if (!processChange) {
      return NextResponse.json(
        { error: 'Process change not found' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const updateData = await request.json();
    
    // Check if user is owner of change or admin
    const isOwner = processChange.changeOwner === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      // Check if user is supervisor trying to update status only
      const isSupervisor = currentUser.role === 'SUPERVISOR';
      const isStatusUpdate = Object.keys(updateData).length === 1 && updateData.status;
      
      if (!(isSupervisor && isStatusUpdate)) {
        return NextResponse.json(
          { error: 'You do not have permission to update this process change' },
          { status: 403 }
        );
      }
    }
    
    // Handle status transitions
    if (updateData.status && updateData.status !== processChange.status) {
      // Check if this is a valid status transition based on role
      if (currentUser.role === 'ENGINEER' && !isOwner) {
        return NextResponse.json(
          { error: 'Only the owner of the change can update its status' },
          { status: 403 }
        );
      }
      
      // Engineers can only propose or submit
      if (currentUser.role === 'ENGINEER' && 
          !['PROPOSED', 'SUBMITTED'].includes(updateData.status)) {
        return NextResponse.json(
          { error: 'Engineers can only set status to PROPOSED or SUBMITTED' },
          { status: 403 }
        );
      }
      
      // Supervisors can approve or reject submitted changes
      if (currentUser.role === 'SUPERVISOR' && 
          updateData.status !== processChange.status) {
        if (processChange.status !== 'SUBMITTED' && 
            ['ACCEPTED', 'REJECTED'].includes(updateData.status)) {
          return NextResponse.json(
            { error: 'Changes must be SUBMITTED before they can be ACCEPTED or REJECTED' },
            { status: 400 }
          );
        }
      }
    }
    
    // Update the process change
    const updatedChange = updateProcessChange(id, updateData);
    
    // Return the updated process change
    return NextResponse.json(updatedChange);
  } catch (error) {
    console.error('Error updating process change:', error);
    return NextResponse.json(
      { error: 'Failed to update process change' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a process change
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const id = parseInt(params.id);
    
    // Check if ID is a valid number
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Get the existing process change
    const processChange = getProcessChangeById(id);
    
    // Check if process change exists
    if (!processChange) {
      return NextResponse.json(
        { error: 'Process change not found' },
        { status: 404 }
      );
    }
    
    // Check if user is owner of change or admin
    const isOwner = processChange.changeOwner === currentUser.id;
    const isAdmin = currentUser.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this process change' },
        { status: 403 }
      );
    }
    
    // Delete the process change
    const success = deleteProcessChange(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete process change' },
        { status: 500 }
      );
    }
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting process change:', error);
    return NextResponse.json(
      { error: 'Failed to delete process change' },
      { status: 500 }
    );
  }
} 
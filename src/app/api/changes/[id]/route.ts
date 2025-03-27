import { NextRequest, NextResponse } from 'next/server';
import { 
  getProcessChangeById, 
  updateProcessChange, 
  deleteProcessChange,
  ProcessStatus 
} from '@/lib/db/process-changes';
// @ts-ignore
import { currentUser } from '@clerk/nextjs';
import { getUserByClerkId, hasRole } from '@/lib/auth';

// GET /api/changes/:id - Get a single process change
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    const change = getProcessChangeById(id);
    
    if (!change) {
      return NextResponse.json(
        { error: 'Process change not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(change);
  } catch (error) {
    console.error('Error fetching process change:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process change' },
      { status: 500 }
    );
  }
}

// PATCH /api/changes/:id - Update a process change
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user and check permissions
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
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Get existing change to check ownership
    const existingChange = getProcessChangeById(id);
    if (!existingChange) {
      return NextResponse.json(
        { error: 'Process change not found' },
        { status: 404 }
      );
    }
    
    // Check if user is allowed to update this change
    const isOwner = existingChange.changeOwner === user.id;
    const isAdmin = hasRole(user.role, 'ADMIN');
    const isSupervisor = hasRole(user.role, 'SUPERVISOR');
    
    // Only owner or admin can edit details, supervisor can only update status
    let updateData = await request.json();
    
    if (!isOwner && !isAdmin) {
      // If not owner or admin, supervisor can only update status
      if (isSupervisor) {
        // Filter out all fields except status and generalComments
        updateData = {
          status: updateData.status,
          generalComments: updateData.generalComments,
          acceptanceDate: updateData.status === 'ACCEPTED' ? new Date().toISOString() : existingChange.acceptanceDate
        };
      } else {
        return NextResponse.json(
          { error: 'You do not have permission to update this process change' },
          { status: 403 }
        );
      }
    }
    
    // Validate status transitions based on user role
    if (updateData.status && updateData.status !== existingChange.status) {
      if (isOwner && !isAdmin && !isSupervisor) {
        // Engineer can only transition from OPEN to SUBMITTED
        if (!(existingChange.status === 'OPEN' && updateData.status === 'SUBMITTED')) {
          return NextResponse.json(
            { error: 'Invalid status transition for Engineer' },
            { status: 400 }
          );
        }
      } else if (isSupervisor) {
        // Supervisor can transition from PROPOSED to OPEN, or from SUBMITTED to ACCEPTED/REJECTED
        const validTransitions: Record<ProcessStatus, ProcessStatus[]> = {
          'PROPOSED': ['OPEN'],
          'OPEN': [],
          'SUBMITTED': ['ACCEPTED', 'REJECTED'],
          'ACCEPTED': [],
          'REJECTED': []
        };
        
        if (!validTransitions[existingChange.status]?.includes(updateData.status)) {
          return NextResponse.json(
            { error: 'Invalid status transition for Supervisor' },
            { status: 400 }
          );
        }
      }
      // Admin can do any transition
    }
    
    // Update the process change
    const updatedChange = updateProcessChange(id, updateData);
    
    return NextResponse.json(updatedChange);
  } catch (error) {
    console.error('Error updating process change:', error);
    return NextResponse.json(
      { error: 'Failed to update process change' },
      { status: 500 }
    );
  }
}

// DELETE /api/changes/:id - Delete a process change
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user and check permissions
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
    
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }
    
    // Get existing change to check ownership
    const existingChange = getProcessChangeById(id);
    if (!existingChange) {
      return NextResponse.json(
        { error: 'Process change not found' },
        { status: 404 }
      );
    }
    
    // Only owner or admin can delete a change
    const isOwner = existingChange.changeOwner === user.id;
    const isAdmin = hasRole(user.role, 'ADMIN');
    
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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting process change:', error);
    return NextResponse.json(
      { error: 'Failed to delete process change' },
      { status: 500 }
    );
  }
} 
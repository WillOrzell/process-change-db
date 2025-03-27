import { NextRequest, NextResponse } from 'next/server';
import { getProcessChanges, createProcessChange } from '../../../lib/db/process-changes';
import { initializeDatabase } from '../../../lib/db/database';
// @ts-ignore
import { currentUser } from '@clerk/nextjs';
import { getUserByClerkId } from '@/lib/auth';

// Initialize the database on first request
initializeDatabase();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const status = searchParams.get('status') as any;
    const processArea = searchParams.get('processArea') as any;
    const changeOwner = searchParams.get('changeOwner') 
      ? parseInt(searchParams.get('changeOwner') as string) 
      : undefined;
    
    // Apply filters if they exist
    const filters: any = {};
    if (status) filters.status = status;
    if (processArea) filters.processArea = processArea;
    if (changeOwner) filters.changeOwner = changeOwner;
    
    const hasFilters = Object.keys(filters).length > 0;
    
    // Get process changes
    const changes = getProcessChanges(hasFilters ? filters : undefined);
    
    return NextResponse.json(changes);
  } catch (error) {
    console.error('Error fetching process changes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process changes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user
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
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'processArea', 'reason', 'changeOverview'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Set defaults for new process change
    const now = new Date().toISOString();
    const processChange = {
      ...data,
      status: 'PROPOSED',
      changeOwner: user.id,
      proposalDate: data.proposalDate || now,
      targetDate: data.targetDate || now,
      specUpdated: data.specUpdated || false,
    };
    
    // Create the process change
    const newChange = createProcessChange(processChange);
    
    return NextResponse.json(newChange, { status: 201 });
  } catch (error) {
    console.error('Error creating process change:', error);
    return NextResponse.json(
      { error: 'Failed to create process change' },
      { status: 500 }
    );
  }
} 
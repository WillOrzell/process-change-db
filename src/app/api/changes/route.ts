import { NextRequest, NextResponse } from 'next/server';
import { getProcessChanges } from '../../../lib/db/process-changes';
import { initializeDatabase } from '../../../lib/db/database';

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
    // This will be implemented later
    return NextResponse.json(
      { error: 'Not implemented yet' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error creating process change:', error);
    return NextResponse.json(
      { error: 'Failed to create process change' },
      { status: 500 }
    );
  }
} 
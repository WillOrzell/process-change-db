import { NextRequest, NextResponse } from 'next/server';
import { ProcessChangeInput } from '@/lib/db/process-changes'; 
import { 
  getProcessChanges,
  createProcessChange
} from '@/lib/db/mock-data'; // Use mock data instead of SQLite
import { getCurrentUser } from '@/lib/local-auth'; // Use local auth

// GET handler to fetch all process changes
export async function GET() {
  try {
    // Get all process changes from the mock database
    const changes = getProcessChanges();

    // Return the process changes
    return NextResponse.json(changes);
  } catch (error) {
    console.error('Error fetching process changes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch process changes' },
      { status: 500 }
    );
  }
}

// POST handler to create a new process change
export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'You must be authenticated to create a process change' },
        { status: 401 }
      );
    }

    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'processArea', 'reason', 'changeOverview'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Prepare data for process change
    const processChange: ProcessChangeInput = {
      title: data.title,
      status: 'PROPOSED', // Default status
      processArea: data.processArea,
      changeOwner: currentUser.id,
      proposalDate: data.proposalDate || new Date().toISOString(),
      targetDate: data.targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days in the future
      reason: data.reason,
      changeOverview: data.changeOverview,
      generalComments: data.generalComments || '',
      attachments: data.attachments || '[]',
      specUpdated: data.specUpdated || false,
    };
    
    // Create the process change in the mock database
    const createdChange = createProcessChange(processChange);
    
    // Return the created process change
    return NextResponse.json(createdChange, { status: 201 });
  } catch (error) {
    console.error('Error creating process change:', error);
    return NextResponse.json(
      { error: 'Failed to create process change' },
      { status: 500 }
    );
  }
} 
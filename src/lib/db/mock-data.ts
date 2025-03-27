import { ProcessChange, ProcessStatus, ProcessArea, ProcessChangeInput } from './process-types';

// Mock database for process changes
let processChanges: ProcessChange[] = [
  {
    id: 1,
    status: 'PROPOSED',
    title: 'Change ETCH chemical formula',
    processArea: 'ETCH',
    changeOwner: 1, // Engineer user ID
    proposalDate: '2023-11-01T00:00:00.000Z',
    targetDate: '2023-12-15T00:00:00.000Z',
    acceptanceDate: undefined,
    ageOfChange: 45,
    reason: 'Current chemical formula is causing inconsistent etch rates across wafers.',
    changeOverview: 'Replace current Buffered Oxide Etch (BOE) with a new formulation that has shown better uniformity in lab tests.\n\nThe new formula has a 7:1 ratio instead of the current 6:1 ratio.',
    generalComments: '',
    attachments: JSON.stringify(['/uploads/change-1/etch_test_results.pdf']),
    specUpdated: false,
    createdAt: '2023-11-01T00:00:00.000Z',
    updatedAt: '2023-11-01T00:00:00.000Z',
  },
  {
    id: 2,
    status: 'OPEN',
    title: 'Update Diffusion temperature profile',
    processArea: 'DIFFUSION',
    changeOwner: 1, // Engineer user ID
    proposalDate: '2023-10-15T00:00:00.000Z',
    targetDate: '2023-12-01T00:00:00.000Z',
    acceptanceDate: undefined,
    ageOfChange: 62,
    reason: 'Current temperature profile is causing excessive dopant diffusion.',
    changeOverview: 'Modify the temperature ramp rate from 10°C/min to 5°C/min.\nReduce max temperature from 1050°C to 1025°C.\nExtend soak time from 30 minutes to 35 minutes.',
    generalComments: 'Reviewed initial proposal. Please include simulation results for the new profile.',
    attachments: JSON.stringify([]),
    specUpdated: true,
    createdAt: '2023-10-15T00:00:00.000Z',
    updatedAt: '2023-10-25T00:00:00.000Z',
  },
  {
    id: 3,
    status: 'ACCEPTED',
    title: 'New saw blade for wafer dicing',
    processArea: 'SAW',
    changeOwner: 1, // Engineer user ID
    proposalDate: '2023-09-05T00:00:00.000Z',
    targetDate: '2023-10-01T00:00:00.000Z',
    acceptanceDate: '2023-09-20T00:00:00.000Z',
    ageOfChange: 102,
    reason: 'Current blades are causing excessive chipping on wafer edges.',
    changeOverview: 'Replace the current 2.0mm diamond blade with a new 1.8mm resin-bond blade from Vendor XYZ. Tests show 35% reduction in edge chipping.',
    generalComments: 'Approved after successful test runs. Please monitor closely during initial implementation.',
    attachments: JSON.stringify(['/uploads/change-3/blade_test_report.pdf', '/uploads/change-3/vendor_specs.pdf']),
    specUpdated: true,
    createdAt: '2023-09-05T00:00:00.000Z',
    updatedAt: '2023-09-20T00:00:00.000Z',
  }
];

// Mock functions to mimic the database operations

// Get all process changes with optional filtering
export function getProcessChanges(filters?: {
  status?: ProcessStatus;
  processArea?: ProcessArea;
  changeOwner?: number;
}): ProcessChange[] {
  let result = [...processChanges];

  if (filters) {
    if (filters.status) {
      result = result.filter(change => change.status === filters.status);
    }
    
    if (filters.processArea) {
      result = result.filter(change => change.processArea === filters.processArea);
    }
    
    if (filters.changeOwner) {
      result = result.filter(change => change.changeOwner === filters.changeOwner);
    }
  }
  
  // Sort by most recently updated
  return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

// Get a single process change by ID
export function getProcessChangeById(id: number): ProcessChange | null {
  return processChanges.find(change => change.id === id) || null;
}

// Create a new process change
export function createProcessChange(input: ProcessChangeInput): ProcessChange {
  // Calculate age of change if not provided
  const ageOfChange = input.ageOfChange || calculateAgeOfChange(input.proposalDate);
  
  // Get the next ID
  const nextId = processChanges.length > 0 
    ? Math.max(...processChanges.map(c => c.id)) + 1 
    : 1;
  
  const now = new Date().toISOString();
  
  const newChange: ProcessChange = {
    id: nextId,
    ...input,
    ageOfChange,
    createdAt: now,
    updatedAt: now
  };
  
  processChanges.push(newChange);
  return newChange;
}

// Update a process change
export function updateProcessChange(id: number, updates: Partial<ProcessChangeInput>): ProcessChange | null {
  const index = processChanges.findIndex(change => change.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const existingChange = processChanges[index];
  const now = new Date().toISOString();
  
  const updatedChange: ProcessChange = {
    ...existingChange,
    ...updates,
    updatedAt: now,
    // Special handling for acceptanceDate
    acceptanceDate: updates.status === 'ACCEPTED' 
      ? updates.acceptanceDate || now 
      : existingChange.acceptanceDate
  };
  
  processChanges[index] = updatedChange;
  return updatedChange;
}

// Delete a process change
export function deleteProcessChange(id: number): boolean {
  const initialLength = processChanges.length;
  processChanges = processChanges.filter(change => change.id !== id);
  return processChanges.length < initialLength;
}

// Helper function to calculate age of change in days
function calculateAgeOfChange(proposalDate: string): number {
  const proposal = new Date(proposalDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - proposal.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Initialize the database (creates mock data)
export function initializeDatabase() {
  // Data is already initialized
  return true;
} 
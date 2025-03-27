import { getDb } from "./database";

export type ProcessStatus = "PROPOSED" | "OPEN" | "SUBMITTED" | "ACCEPTED" | "REJECTED";
export type ProcessArea = "METALS" | "ETCH" | "PLATING" | "SAW" | "GRIND" | "PHOTO" | "DIFFUSION" | "OTHER";

export interface ProcessChange {
  id: number;
  status: ProcessStatus;
  title: string;
  processArea: ProcessArea;
  changeOwner: number;
  proposalDate: string;
  targetDate: string;
  acceptanceDate?: string;
  ageOfChange: number;
  reason: string;
  changeOverview: string;
  generalComments?: string;
  attachments?: string;
  specUpdated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProcessChangeInput extends Omit<ProcessChange, 'id' | 'ageOfChange' | 'createdAt' | 'updatedAt'> {
  ageOfChange?: number;
}

/**
 * Create a new process change record
 */
export function createProcessChange(input: ProcessChangeInput): ProcessChange {
  const db = getDb();
  try {
    // Calculate age of change if not provided
    const ageOfChange = input.ageOfChange || calculateAgeOfChange(input.proposalDate);
    
    // Convert boolean to integer for SQLite
    const specUpdated = input.specUpdated ? 1 : 0;
    
    const result = db.prepare(`
      INSERT INTO ProcessChanges (
        status, title, processArea, changeOwner, proposalDate, targetDate,
        acceptanceDate, ageOfChange, reason, changeOverview, generalComments,
        attachments, specUpdated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.status,
      input.title,
      input.processArea,
      input.changeOwner,
      input.proposalDate,
      input.targetDate,
      input.acceptanceDate || null,
      ageOfChange,
      input.reason,
      input.changeOverview,
      input.generalComments || null,
      input.attachments || null,
      specUpdated
    );
    
    const newChange = db.prepare(`
      SELECT * FROM ProcessChanges WHERE id = ?
    `).get(result.lastInsertRowid);
    
    return formatProcessChange(newChange);
  } finally {
    db.close();
  }
}

/**
 * Get all process changes with optional filtering
 */
export function getProcessChanges(filters?: {
  status?: ProcessStatus;
  processArea?: ProcessArea;
  changeOwner?: number;
}): ProcessChange[] {
  const db = getDb();
  try {
    let query = `SELECT * FROM ProcessChanges`;
    const whereConditions: string[] = [];
    const params: any[] = [];
    
    if (filters) {
      if (filters.status) {
        whereConditions.push('status = ?');
        params.push(filters.status);
      }
      
      if (filters.processArea) {
        whereConditions.push('processArea = ?');
        params.push(filters.processArea);
      }
      
      if (filters.changeOwner) {
        whereConditions.push('changeOwner = ?');
        params.push(filters.changeOwner);
      }
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY updatedAt DESC`;
    
    const changes = db.prepare(query).all(...params);
    return changes.map(formatProcessChange);
  } finally {
    db.close();
  }
}

/**
 * Get a single process change by ID
 */
export function getProcessChangeById(id: number): ProcessChange | null {
  const db = getDb();
  try {
    const change = db.prepare(`
      SELECT * FROM ProcessChanges WHERE id = ?
    `).get(id);
    
    return change ? formatProcessChange(change) : null;
  } finally {
    db.close();
  }
}

/**
 * Update a process change
 */
export function updateProcessChange(id: number, updates: Partial<ProcessChangeInput>): ProcessChange | null {
  const db = getDb();
  try {
    const currentChange = db.prepare(`
      SELECT * FROM ProcessChanges WHERE id = ?
    `).get(id);
    
    if (!currentChange) {
      return null;
    }
    
    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'specUpdated') {
          updateFields.push(`${key} = ?`);
          values.push(value ? 1 : 0);
        } else {
          updateFields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });
    
    // Always update the updatedAt timestamp
    updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    
    if (updateFields.length === 0) {
      return formatProcessChange(currentChange);
    }
    
    values.push(id); // Add ID for WHERE clause
    
    db.prepare(`
      UPDATE ProcessChanges 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `).run(...values);
    
    const updatedChange = db.prepare(`
      SELECT * FROM ProcessChanges WHERE id = ?
    `).get(id);
    
    return formatProcessChange(updatedChange);
  } finally {
    db.close();
  }
}

/**
 * Delete a process change
 */
export function deleteProcessChange(id: number): boolean {
  const db = getDb();
  try {
    const result = db.prepare(`
      DELETE FROM ProcessChanges WHERE id = ?
    `).run(id);
    
    return result.changes > 0;
  } finally {
    db.close();
  }
}

/**
 * Helper function to calculate age of change in days
 */
function calculateAgeOfChange(proposalDate: string): number {
  const proposal = new Date(proposalDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - proposal.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Helper function to format database result to ProcessChange object
 */
function formatProcessChange(data: any): ProcessChange {
  return {
    ...data,
    specUpdated: Boolean(data.specUpdated)
  };
} 
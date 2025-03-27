// @ts-ignore
import { clerkClient } from "@clerk/nextjs";
import { getDb } from "./db/database";

export type UserRole = "ENGINEER" | "SUPERVISOR" | "ADMIN";

export interface UserData {
  id: number;
  clerkUserId: string;
  role: UserRole;
  badgeNumber?: string;
  name?: string;
  email?: string;
}

/**
 * Get a user from the local database by their Clerk ID
 */
export async function getUserByClerkId(clerkUserId: string): Promise<UserData | null> {
  const db = getDb();
  try {
    const user = db.prepare("SELECT * FROM Users WHERE clerkUserId = ?").get(clerkUserId);
    return user as UserData || null;
  } finally {
    db.close();
  }
}

/**
 * Create a new user in the local database
 */
export async function createUser(userData: Omit<UserData, 'id'>): Promise<UserData> {
  const db = getDb();
  try {
    const result = db.prepare(`
      INSERT INTO Users (clerkUserId, role, badgeNumber, name, email) 
      VALUES (?, ?, ?, ?, ?)
    `).run(
      userData.clerkUserId,
      userData.role,
      userData.badgeNumber || null,
      userData.name || null,
      userData.email || null
    );
    
    const newUser = db.prepare("SELECT * FROM Users WHERE id = ?").get(result.lastInsertRowid);
    return newUser as UserData;
  } finally {
    db.close();
  }
}

/**
 * Update a user's role or information
 */
export async function updateUser(id: number, userData: Partial<Omit<UserData, 'id' | 'clerkUserId'>>): Promise<UserData | null> {
  const db = getDb();
  try {
    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const values: any[] = [];
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (updateFields.length === 0) {
      const user = db.prepare("SELECT * FROM Users WHERE id = ?").get(id);
      return user as UserData || null;
    }
    
    values.push(id); // Add ID for WHERE clause
    
    db.prepare(`
      UPDATE Users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `).run(...values);
    
    const updatedUser = db.prepare("SELECT * FROM Users WHERE id = ?").get(id);
    return updatedUser as UserData || null;
  } finally {
    db.close();
  }
}

/**
 * Check if a user has at least the specified role
 * Admin > Supervisor > Engineer
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    "ADMIN": 3,
    "SUPERVISOR": 2,
    "ENGINEER": 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
} 
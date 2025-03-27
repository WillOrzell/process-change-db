// @ts-ignore
import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// DB file path
const dbPath = path.join(dataDir, 'app_database.db');

// Create and initialize the database
export function initializeDatabase() {
  const db = BetterSqlite3(dbPath);
  
  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clerkUserId TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('ENGINEER', 'SUPERVISOR', 'ADMIN')),
      badgeNumber TEXT,
      name TEXT,
      email TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create ProcessChanges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ProcessChanges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL CHECK(status IN ('PROPOSED', 'OPEN', 'SUBMITTED', 'ACCEPTED', 'REJECTED')),
      title TEXT NOT NULL,
      processArea TEXT CHECK(processArea IN ('METALS', 'ETCH', 'PLATING', 'SAW', 'GRIND', 'PHOTO', 'DIFFUSION', 'OTHER')),
      changeOwner INTEGER,
      proposalDate TEXT,
      targetDate TEXT,
      acceptanceDate TEXT,
      ageOfChange INTEGER,
      reason TEXT,
      changeOverview TEXT,
      generalComments TEXT,
      attachments TEXT,
      specUpdated BOOLEAN DEFAULT 0,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(changeOwner) REFERENCES Users(id)
    )
  `);
  
  return db;
}

// Get a database connection
export function getDb() {
  try {
    return BetterSqlite3(dbPath);
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

// Close the database connection
export function closeDb(db: any) {
  db.close();
}

// Default export for easier imports
export default getDb; 
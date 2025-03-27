// Mock database implementation for development

// Mock DB class with a dummy prepare method that returns chainable methods
class MockDB {
  // This is a simple mock object that pretends to be a database
  // In real code, this would use better-sqlite3 or another SQLite library
  
  // Mock the prepare method to return chainable methods
  prepare(query: string) {
    console.log('MOCK DB QUERY:', query);
    
    return {
      run: (...params: any[]) => {
        console.log('MOCK DB RUN with params:', params);
        return { 
          lastInsertRowid: Date.now(),
          changes: 1 
        };
      },
      get: (param?: any) => {
        console.log('MOCK DB GET with param:', param);
        return null;
      },
      all: (...params: any[]) => {
        console.log('MOCK DB ALL with params:', params);
        return [];
      }
    };
  }
  
  // Mock the close method
  close() {
    console.log('MOCK DB CLOSE');
  }
}

// Return a mock DB instance
export function getDb() {
  return new MockDB();
}

// Mock database initialization function
export function initializeDatabase() {
  console.log('MOCK DB INITIALIZED');
  return true;
}

// Mock database closing function
export function closeDb() {
  console.log('MOCK DB CLOSED');
  return true;
} 
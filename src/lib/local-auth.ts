// This is a simplified auth system to replace Clerk temporarily
import { UserData, UserRole } from './auth';

// Mock user database - in a real app, this would come from a database
const mockUsers: UserData[] = [
  {
    id: 1,
    clerkUserId: 'user_1',
    role: 'ENGINEER',
    badgeNumber: 'E001',
    name: 'John Engineer',
    email: 'john@example.com'
  },
  {
    id: 2,
    clerkUserId: 'user_2',
    role: 'SUPERVISOR',
    badgeNumber: 'S001',
    name: 'Jane Supervisor',
    email: 'jane@example.com'
  },
  {
    id: 3,
    clerkUserId: 'user_3',
    role: 'ADMIN',
    badgeNumber: 'A001',
    name: 'Admin User',
    email: 'admin@example.com'
  }
];

// Simulate logged in user - in a real app, this would be managed via cookies/sessions
let currentUser: UserData | null = mockUsers[0]; // Default to the first user (engineer)

export function getCurrentUser(): Promise<UserData | null> {
  return Promise.resolve(currentUser);
}

export function setCurrentUser(userId: string): Promise<UserData | null> {
  const user = mockUsers.find(u => u.clerkUserId === userId);
  currentUser = user || null;
  return Promise.resolve(currentUser);
}

// In client components, use this hook to get the current user
export function useAuth() {
  return {
    user: currentUser,
    isLoaded: true,
    isSignedIn: Boolean(currentUser),
    setUser: (userId: string) => setCurrentUser(userId)
  };
}

// Use this to check if a user has the required role (same as the original auth.ts)
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    "ADMIN": 3,
    "SUPERVISOR": 2,
    "ENGINEER": 1
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
} 
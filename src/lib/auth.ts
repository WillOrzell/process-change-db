// Simplified auth types without Clerk dependencies
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
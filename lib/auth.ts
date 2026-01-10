// lib/auth.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { userRoles, users } from "@/lib/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { User } from "@/lib/db/schema";

export async function getSession() {
  return await getServerSession(authOptions);
}

// Modified getCurrentUser to fetch the complete user from the database
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  
  if (!session?.user?.id) {
    return null;
  }
  
  // Convert the string ID from the session to a number for the database query
  const userId = parseInt(session.user.id, 10);
  
  if (isNaN(userId)) {
    return null;
  }
  
  // Fetch the complete user from the database
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  return user || null;
}

// The rest of your functions remain the same
export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === userRoles.ADMIN;
}

export async function isEditor() {
  const session = await getSession();
  const role = session?.user?.role;
  return role === userRoles.EDITOR || role === userRoles.ADMIN;
}

export async function isContributor() {
  const session = await getSession();
  const role = session?.user?.role;
  return (
    role === userRoles.CONTRIBUTOR ||
    role === userRoles.EDITOR ||
    role === userRoles.ADMIN
  );
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== userRoles.ADMIN) {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

export async function requireEditor(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== userRoles.EDITOR && user.role !== userRoles.ADMIN) {
    throw new Error("Unauthorized: Editor access required");
  }
  return user;
}

export async function requireContributor(): Promise<User> {
  const user = await requireAuth();
  if (
    user.role !== userRoles.CONTRIBUTOR &&
    user.role !== userRoles.EDITOR &&
    user.role !== userRoles.ADMIN
  ) {
    throw new Error("Unauthorized: Contributor access required");
  }
  return user;
}

// Add this missing function
export async function requireAdminOrEditor(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== userRoles.ADMIN && user.role !== userRoles.EDITOR) {
    throw new Error("Unauthorized: Admin or Editor access required");
  }
  return user;
}

// Helper to check if user has any of the specified roles
export async function hasRole(roles: string[]) {
  const session = await getSession();
  return session?.user?.role ? roles.includes(session.user.role) : false;
}

// Helper for role hierarchy checks
export async function hasMinimumRole(minimumRole: string) {
  const session = await getSession();
  const role = session?.user?.role;
  
  if (!role) return false;
  
  const roleHierarchy = {
    [userRoles.READER]: 0,
    [userRoles.CONTRIBUTOR]: 1,
    [userRoles.EDITOR]: 2,
    [userRoles.ADMIN]: 3,
  };
  
  return roleHierarchy[role as keyof typeof roleHierarchy] >= 
         roleHierarchy[minimumRole as keyof typeof roleHierarchy];
}

export { authOptions };

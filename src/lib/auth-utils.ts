import { hash, compare } from "bcryptjs"
import { auth } from "./auth"

/**
 * Hash password with bcryptjs + pepper
 */
export async function hashPassword(password: string): Promise<string> {
  const pepper = process.env.BCRYPT_PEPPER || "";
  return hash(password + pepper, 12)
}

/**
 * Verify password (with pepper)
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const pepper = process.env.BCRYPT_PEPPER || "";
  return compare(password + pepper, hashedPassword)
}

/**
 * Get current authenticated user session
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.id || null
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth()
  return !!session?.user
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized: Please sign in")
  }
  return session.user
}

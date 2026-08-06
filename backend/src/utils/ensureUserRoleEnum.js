import { prisma } from "../config/database.js";

/** Roles stored on the users table (must match CockroachDB Role enum). */
export const LISTABLE_USER_ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"];

/**
 * Idempotent: ensure Role enum includes values used by Prisma schema.
 * Super-admin portal access uses authorized_admins, not users.role.
 */
export async function ensureUserRoleEnum() {
  for (const value of ["INSTRUCTOR", "SUPER_ADMIN"]) {
    await prisma.$executeRawUnsafe(`
      ALTER TYPE "Role" ADD VALUE IF NOT EXISTS '${value}';
    `).catch(() => {
      /* value may already exist or IF NOT EXISTS unsupported */
    });
  }
}

export function isListableUserRole(role) {
  return LISTABLE_USER_ROLES.includes(role);
}

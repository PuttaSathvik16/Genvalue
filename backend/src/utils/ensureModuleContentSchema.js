import { prisma } from "../config/database.js";

/**
 * Idempotent: adds contentMeta JSON column to modules for rich LMS editor data.
 */
export async function ensureModuleContentSchema() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE modules ADD COLUMN IF NOT EXISTS "contentMeta" STRING;
  `);
}

import { prisma } from "../config/database.js";
import crypto from "crypto";

/**
 * Idempotent: ensures user_removal_logs table exists for student removal audit trail.
 */
export async function ensureUserRemovalLogSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_removal_logs (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      "userId" STRING NOT NULL,
      email STRING NOT NULL,
      name STRING NOT NULL,
      reason STRING NOT NULL,
      "removedById" STRING,
      "removedByEmail" STRING,
      "createdAt" TIMESTAMP NOT NULL DEFAULT current_timestamp()
    );
  `);
}

export async function insertUserRemovalLog({
  userId,
  email,
  name,
  reason,
  removedById,
  removedByEmail,
}) {
  await ensureUserRemovalLogSchema();

  const id = crypto.randomUUID();

  await prisma.$executeRaw`
    INSERT INTO user_removal_logs (id, "userId", email, name, reason, "removedById", "removedByEmail")
    VALUES (${id}, ${userId}, ${email}, ${name}, ${reason}, ${removedById}, ${removedByEmail})
  `;

  return id;
}

export async function fetchRecentUserRemovalLogs(limit = 100) {
  await ensureUserRemovalLogSchema();

  const rows = await prisma.$queryRaw`
    SELECT id, "userId", email, name, reason, "removedByEmail", "createdAt"
    FROM user_removal_logs
    ORDER BY "createdAt" DESC
    LIMIT ${limit}
  `;

  return rows;
}

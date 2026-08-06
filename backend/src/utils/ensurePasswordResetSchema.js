import { prisma } from "../config/database.js";

/**
 * Idempotent: creates password_reset_otps table for student forgot-password flow.
 */
export async function ensurePasswordResetSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS password_reset_otps (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      email STRING NOT NULL,
      otp STRING NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      verified BOOL NOT NULL DEFAULT false,
      "resetToken" STRING,
      "resetTokenExpiresAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT current_timestamp()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS password_reset_otps_email_key ON password_reset_otps (email);
  `).catch(() => {});

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS password_reset_otps_reset_token_key ON password_reset_otps ("resetToken");
  `).catch(() => {});
}

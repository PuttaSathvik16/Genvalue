import { prisma } from "../config/database.js";

/**
 * Idempotent: dedupe admin_otps rows and ensure unique index on email.
 * Safe to run on every server boot.
 */
export async function ensureAdminOtpSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS admin_otps (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      email STRING NOT NULL,
      otp STRING NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      verified BOOL NOT NULL DEFAULT false
    );
  `);

  await prisma.$executeRawUnsafe(`
    DELETE FROM admin_otps
    WHERE id IN (
      SELECT id FROM (
        SELECT id,
          ROW_NUMBER() OVER (
            PARTITION BY LOWER(email)
            ORDER BY "createdAt" DESC
          ) AS rn
        FROM admin_otps
      ) ranked
      WHERE rn > 1
    );
  `).catch(() => {
    /* table may be empty */
  });

  await prisma.$executeRawUnsafe(`
    UPDATE admin_otps SET email = LOWER(TRIM(email)) WHERE email <> LOWER(TRIM(email));
  `).catch(() => {
    /* ignore */
  });

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS admin_otps_email_key ON admin_otps (email);
  `);
}

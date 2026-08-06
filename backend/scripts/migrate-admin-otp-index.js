/**
 * Adds unique index on admin_otps.email (required for Prisma upsert).
 * Run from backend/: bun scripts/migrate-admin-otp-index.js
 */
import { prisma } from "../src/config/database.js";

async function main() {
  console.log("Deduplicating admin_otps by email...");

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
    console.log("Skipping dedupe (table may be empty or syntax unsupported)");
  });

  console.log("Adding unique index on admin_otps.email if missing...");

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS admin_otps_email_key ON admin_otps (email);
  `);

  console.log("✅ admin_otps.email unique index ready");
}

main()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

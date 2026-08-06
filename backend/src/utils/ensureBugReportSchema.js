import { prisma } from "../config/database.js";

/**
 * Idempotent: ensures bug_reports table exists with STRING status/category columns.
 * Migrates legacy BugReportStatus/BugReportCategory enum columns if present.
 */
export async function ensureBugReportSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS bug_reports (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      "userId" STRING NOT NULL,
      "userEmail" STRING NOT NULL,
      "userName" STRING NOT NULL,
      category STRING NOT NULL DEFAULT 'BUG',
      title STRING NOT NULL,
      description STRING NOT NULL,
      "pageUrl" STRING,
      "screenshotUrl" STRING,
      "userAgent" STRING,
      status STRING NOT NULL DEFAULT 'OPEN',
      "adminNotes" STRING,
      "resolvedByEmail" STRING,
      "resolvedAt" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT current_timestamp()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS bug_reports_user_id_idx ON bug_reports ("userId");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS bug_reports_status_idx ON bug_reports (status);
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS bug_reports_created_at_idx ON bug_reports ("createdAt");
  `);

  await migrateBugReportEnumColumnsToString();
  await ensureBugReportScreenshotColumn();
}

async function ensureBugReportScreenshotColumn() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE bug_reports ADD COLUMN IF NOT EXISTS "screenshotUrl" STRING;
  `);
}

async function migrateBugReportEnumColumnsToString() {
  const enumColumns = await prisma.$queryRawUnsafe(`
    SELECT column_name, udt_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'bug_reports'
      AND column_name IN ('status', 'category')
      AND udt_name IN ('BugReportStatus', 'BugReportCategory');
  `);

  if (!Array.isArray(enumColumns) || enumColumns.length === 0) {
    return;
  }

  for (const row of enumColumns) {
    const column = row.column_name;
    await prisma.$executeRawUnsafe(`
      ALTER TABLE bug_reports
      ALTER COLUMN ${column} TYPE STRING USING ${column}::STRING;
    `);
  }

  console.log(
    "[bugReport] Migrated bug_reports enum columns to STRING:",
    enumColumns.map((row) => row.column_name).join(", ")
  );
}

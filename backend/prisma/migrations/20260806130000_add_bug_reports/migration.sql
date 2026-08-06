-- Student bug reports (status/category stored as STRING for Cockroach compatibility)
CREATE TABLE IF NOT EXISTS "bug_reports" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "userEmail" STRING NOT NULL,
    "userName" STRING NOT NULL,
    "category" STRING NOT NULL DEFAULT 'BUG',
    "title" STRING NOT NULL,
    "description" STRING NOT NULL,
    "pageUrl" STRING,
    "userAgent" STRING,
    "status" STRING NOT NULL DEFAULT 'OPEN',
    "adminNotes" STRING,
    "resolvedByEmail" STRING,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "bug_reports_userId_idx" ON "bug_reports"("userId");
CREATE INDEX IF NOT EXISTS "bug_reports_status_idx" ON "bug_reports"("status");
CREATE INDEX IF NOT EXISTS "bug_reports_createdAt_idx" ON "bug_reports"("createdAt");

ALTER TABLE "bug_reports" ADD CONSTRAINT IF NOT EXISTS "bug_reports_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

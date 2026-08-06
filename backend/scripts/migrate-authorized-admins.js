/**
 * Safe migration: ensures authorized_admins table has roles + userLimit columns.
 * Run from backend/: bun scripts/migrate-authorized-admins.js
 */
import { prisma } from "../src/config/database.js";
import {
  ensureAuthorizedAdminSchema,
  ensureSuperAdminRecord,
} from "../src/utils/ensureAuthorizedAdminSchema.js";

async function main() {
  console.log("Ensuring authorized_admins schema...");
  await ensureAuthorizedAdminSchema();

  console.log("Regenerating Prisma client...");
  const { execSync } = await import("node:child_process");
  execSync("npx prisma generate", { stdio: "inherit", cwd: new URL("..", import.meta.url).pathname });

  console.log("Seeding super admin...");
  await ensureSuperAdminRecord();
}

main()
  .catch((error) => {
    console.error("Migration failed:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

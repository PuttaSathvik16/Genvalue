import { prisma } from "../config/database.js";

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || "sujithputta02@gmail.com";

/**
 * Idempotent: ensures authorized_admins has roles + userLimit columns.
 * Safe to run on every server boot.
 */
export async function ensureAuthorizedAdminSchema() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS authorized_admins (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      email STRING NOT NULL UNIQUE,
      name STRING,
      "isSuperAdmin" BOOL NOT NULL DEFAULT false,
      "isActive" BOOL NOT NULL DEFAULT true,
      "addedByEmail" STRING,
      "createdAt" TIMESTAMP NOT NULL DEFAULT current_timestamp(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT current_timestamp()
    );
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE authorized_admins ADD COLUMN IF NOT EXISTS roles STRING[] NOT NULL DEFAULT ARRAY[]::STRING[];
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE authorized_admins ADD COLUMN IF NOT EXISTS "userLimit" INT;
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE authorized_admins ADD COLUMN IF NOT EXISTS "portalSections" STRING[] NOT NULL DEFAULT ARRAY[]::STRING[];
  `);
}

export async function ensureSuperAdminRecord() {
  const existing = await prisma.authorizedAdmin.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (!existing) {
    await prisma.authorizedAdmin.create({
      data: {
        email: SUPER_ADMIN_EMAIL,
        name: "Sujith Putta",
        isSuperAdmin: true,
        isActive: true,
        roles: ["CTO"],
        userLimit: null,
        addedByEmail: "system",
      },
    });
    console.log(`✅ Seeded super admin: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  await prisma.authorizedAdmin.update({
    where: { email: SUPER_ADMIN_EMAIL },
    data: {
      isSuperAdmin: true,
      isActive: true,
      roles: ["CTO"],
      userLimit: null,
    },
  });
  console.log(`✅ Ensured super admin: ${SUPER_ADMIN_EMAIL}`);
}

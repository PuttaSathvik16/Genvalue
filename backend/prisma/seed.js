import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seed...");

  try {
    // Seed the super admin email from environment variable
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();

    if (!superAdminEmail) {
      console.warn(
        "⚠️  SUPER_ADMIN_EMAIL not set in environment. Skipping super admin seed."
      );
      return;
    }

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.authorizedAdmin.findUnique({
      where: { email: superAdminEmail },
    });

    if (existingSuperAdmin) {
      console.log(`✓ Super admin already exists: ${superAdminEmail}`);
      return;
    }

    // Create super admin
    const superAdmin = await prisma.authorizedAdmin.create({
      data: {
        email: superAdminEmail,
        name: "Super Administrator",
        isSuperAdmin: true,
        isActive: true,
        addedByEmail: "system",
      },
    });

    console.log(`✓ Super admin created: ${superAdmin.email}`);
  } catch (error) {
    console.error("Error during seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

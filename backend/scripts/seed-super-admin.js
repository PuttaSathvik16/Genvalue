import { prisma } from "../src/config/database.js";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || "sujithputta02@gmail.com";

async function main() {
  const existing = await prisma.authorizedAdmin.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });

  if (existing) {
    await prisma.authorizedAdmin.update({
      where: { email: SUPER_ADMIN_EMAIL },
      data: { isSuperAdmin: true, isActive: true, name: existing.name || "Sujith Putta" },
    });
    console.log(`Updated super admin: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  await prisma.authorizedAdmin.create({
    data: {
      email: SUPER_ADMIN_EMAIL,
      name: "Sujith Putta",
      isSuperAdmin: true,
      isActive: true,
      addedByEmail: "system",
    },
  });

  console.log(`Created super admin: ${SUPER_ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "./src/config/database.js";

try {
  const count = await prisma.certificate.count();
  console.log("Certificate count:", count);
  await prisma.$disconnect();
  process.exit(0);
} catch (error) {
  console.error("Error:", error);
  await prisma.$disconnect();
  process.exit(1);
}

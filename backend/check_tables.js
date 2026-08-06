const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    // Try a simple query to test connection
    const result = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log("Tables in database:", result);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

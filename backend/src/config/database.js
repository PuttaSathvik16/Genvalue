import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Expand user home directory path
function expandUserPath(filePath) {
  if (filePath.startsWith("~")) {
    return path.join(process.env.HOME || process.env.USERPROFILE, filePath.slice(1));
  }
  return filePath;
}

// Prisma Client instance with PostgreSQL adapter
const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Configure SSL for CockroachDB/PostgreSQL
  let sslConfig = false;
  
  if (connectionString.includes("cockroach") || process.env.NODE_ENV === "production") {
    try {
      const certPath = expandUserPath("~/.postgresql/root.crt");
      if (fs.existsSync(certPath)) {
        sslConfig = {
          rejectUnauthorized: true,
          ca: fs.readFileSync(certPath).toString(),
        };
        console.log("✅ Using SSL certificate for CockroachDB");
      } else {
        sslConfig = {
          rejectUnauthorized: false,
        };
        console.log("⚠️  SSL certificate not found, using insecure connection");
      }
    } catch (err) {
      console.warn("⚠️  Could not configure SSL:", err.message);
      sslConfig = {
        rejectUnauthorized: false,
      };
    }
  }

  const poolConfig = { 
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    statement_timeout: 30000,
    keepalives: true,
    keepalives_idle: 30,
  };

  if (sslConfig) {
    poolConfig.ssl = sslConfig;
  }

  const pool = new Pool(poolConfig);

  // Handle pool errors
  pool.on("error", (err) => {
    console.error("🔴 Unexpected error on idle client:", err);
  });

  const adapter = new PrismaPg(pool);
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

// Global variable to store Prisma instance (prevents multiple instances in development)
const globalForPrisma = globalThis;

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  // Recreate client after schema changes (dev hot-reload keeps stale singleton)
  if (cached?.studentPlannerEvent && cached?.studentActivityLog) {
    return cached;
  }

  const client = prismaClientSingleton();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();

// Test database connection on startup
export async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1 as connected`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;

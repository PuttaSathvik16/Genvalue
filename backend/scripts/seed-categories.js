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

// Initialize Prisma Client with proper adapter
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
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedCategories() {
  const categories = [
    {
      name: "General",
      slug: "general",
      description: "General discussion topics",
      color: "#60A5FA",
      order: 1,
    },
    {
      name: "Technical",
      slug: "technical",
      description: "Technical questions and troubleshooting",
      color: "#8B5CF6",
      order: 2,
    },
    {
      name: "Assignments",
      slug: "assignments",
      description: "Discussion about assignments",
      color: "#EC4899",
      order: 3,
    },
    {
      name: "Course Content",
      slug: "course-content",
      description: "Questions about course material",
      color: "#F59E0B",
      order: 4,
    },
    {
      name: "Resources",
      slug: "resources",
      description: "Sharing and requesting resources",
      color: "#10B981",
      order: 5,
    },
    {
      name: "Off-Topic",
      slug: "off-topic",
      description: "Off-topic conversations",
      color: "#6B7280",
      order: 6,
    },
  ];

  try {
    console.log("🌱 Seeding discussion categories...");

    for (const category of categories) {
      const existing = await prisma.discussionCategory.findUnique({
        where: { slug: category.slug },
      });

      if (existing) {
        console.log(`  ✓ ${category.name} (already exists)`);
      } else {
        await prisma.discussionCategory.create({
          data: category,
        });
        console.log(`  ✓ ${category.name}`);
      }
    }

    console.log("✅ Seeding complete!");

    // Show all categories
    const allCategories = await prisma.discussionCategory.findMany({
      orderBy: { order: "asc" },
    });

    console.log("\n📊 Current categories:");
    allCategories.forEach((cat) => {
      console.log(`  - ${cat.name} (${cat.slug})`);
    });
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

seedCategories();

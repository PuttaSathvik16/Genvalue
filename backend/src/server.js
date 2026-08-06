import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./config/database.js";
import { createApiV1Router } from "./routes/apiV1.js";
import { securityHeaders } from "./middleware/securityHeaders.js";
import { ensureSuperAdminSeeded } from "./controllers/authorizedAdminController.js";
import { ensureAuthorizedAdminSchema } from "./utils/ensureAuthorizedAdminSchema.js";
import { ensureAdminOtpSchema } from "./utils/ensureAdminOtpSchema.js";
import { ensureUserRemovalLogSchema } from "./utils/ensureUserRemovalLogSchema.js";
import { ensureUserRoleEnum } from "./utils/ensureUserRoleEnum.js";
import { ensureFirebaseAdminReady } from "./config/firebase.js";
import { probeFirebasePublicKeyVerification } from "./utils/firebaseIdTokenPublicVerify.js";
import { ensureDefaultCourseCatalog } from "./utils/ensureCourseCatalog.js";
import { ensureModuleContentSchema } from "./utils/ensureModuleContentSchema.js";
import { ensureAssignmentSubmissionSchema } from "./utils/ensureAssignmentSubmissionSchema.js";
import { ensurePasswordResetSchema } from "./utils/ensurePasswordResetSchema.js";
import { ensureBugReportSchema } from "./utils/ensureBugReportSchema.js";
import { ensureStudentPlannerSchema } from "./utils/ensureStudentPlannerSchema.js";
import { removeLegacySeedAnnouncements } from "./utils/announcementFeed.js";

// Load environment variables (.env wins over empty shell exports)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: path.join(__dirname, "../.env"),
  override: true,
});

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(securityHeaders);
// Increase payload limit for image uploads (10MB for base64 images)
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "GenValue Academy Backend API is running",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Versioned API (canonical) + legacy alias
const apiV1 = createApiV1Router();
app.use("/api/v1", apiV1);
app.use("/api", apiV1);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server with database connection test
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Ensure authorized_admins columns exist before Prisma queries use them
    await ensureAuthorizedAdminSchema();

    // Dedupe admin OTP rows and ensure unique email index
    await ensureAdminOtpSchema();

    // Student removal audit log table
    await ensureUserRemovalLogSchema();

    // Ensure Role enum values exist in CockroachDB
    await ensureUserRoleEnum();

    // Probe Firebase Admin Auth when service account is configured; else public key verify
    const adminReady = await ensureFirebaseAdminReady();
    if (!adminReady && process.env.FIREBASE_PROJECT_ID) {
      const publicKeysOk = await probeFirebasePublicKeyVerification(
        process.env.FIREBASE_PROJECT_ID
      );
      if (publicKeysOk) {
        console.log("✅ Firebase LMS token verification via Google public keys");
      }
    }

    // Seed default LMS course catalog if empty
    await ensureDefaultCourseCatalog();

    await ensureModuleContentSchema();
    await ensureAssignmentSubmissionSchema();
    await ensurePasswordResetSchema();
    await ensureBugReportSchema();
    await ensureStudentPlannerSchema();

    await removeLegacySeedAnnouncements();

    // Ensure super admin is seeded
    await ensureSuperAdminSeeded();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`✅ Backend server running on http://localhost:${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

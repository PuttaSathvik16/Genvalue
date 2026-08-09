import { prisma } from "../config/database.js";
import { adminAuth } from "../config/firebase.js";
import {
  firebaseAdminCredentialsLoaded,
  probeFirebaseAdminAuth,
} from "../utils/firebaseAdminAuth.js";
import { probeFirebasePublicKeyVerification } from "../utils/firebaseIdTokenPublicVerify.js";
import {
  detectHostingEnvironment,
  envConfigured,
  getAdminAccessSnapshot,
  getFrontendUrlStatus,
  getMissingProductionSecrets,
  probeCloudinary,
  probeEmailProvider,
} from "../utils/securityProbes.js";

async function timed(fn) {
  const start = process.hrtime.bigint();
  try {
    const result = await fn();
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    return { ok: true, result, latencyMs: Math.round(latencyMs) };
  } catch (error) {
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Probe failed",
      latencyMs: Math.round(latencyMs),
    };
  }
}

function overallFromServices(services) {
  const failed = services.filter((s) => s.status === "down").length;
  const degraded = services.filter((s) => s.status === "degraded").length;

  if (failed >= 2) return "major_outage";
  if (failed === 1) return "partial_outage";
  if (degraded > 0) return "degraded";
  return "operational";
}

/**
 * GET /api/v1/admin/system-health
 * Live ops snapshot for services GenValue actually runs.
 * SECURITY section / super admin only.
 */
export async function getSystemHealth(req, res) {
  try {
    const checkedAt = new Date().toISOString();
    const isProduction = process.env.NODE_ENV === "production";
    const hosting = detectHostingEnvironment();
    const services = [];

    // 1) API process (this request)
    const apiStarted = process.hrtime.bigint();
    const apiLatencyMs = Math.max(
      1,
      Math.round(Number(process.hrtime.bigint() - apiStarted) / 1e6)
    );
    services.push({
      id: "api",
      name: "API Server",
      group: "core",
      status: "operational",
      latencyMs: apiLatencyMs,
      detail: "Admin API process is responding to health probes.",
    });

    // 2) Database
    const dbProbe = await timed(() => prisma.$queryRaw`SELECT 1`);
    services.push({
      id: "database",
      name: "Database",
      group: "core",
      status: dbProbe.ok ? "operational" : "down",
      latencyMs: dbProbe.latencyMs,
      detail: dbProbe.ok
        ? "CockroachDB/Prisma accepted a live query."
        : dbProbe.error || "Database unreachable.",
    });

    // 3) Firebase / LMS auth
    const projectId = process.env.FIREBASE_PROJECT_ID || "";
    const firebaseProbe = await timed(async () => {
      const publicKeyOk = projectId
        ? await probeFirebasePublicKeyVerification(projectId)
        : false;
      const adminOk = firebaseAdminCredentialsLoaded
        ? await probeFirebaseAdminAuth(adminAuth)
        : false;
      return { publicKeyOk, adminOk, configured: Boolean(projectId) };
    });

    if (!firebaseProbe.ok) {
      services.push({
        id: "firebase-auth",
        name: "LMS Authentication",
        group: "auth",
        status: "down",
        latencyMs: firebaseProbe.latencyMs,
        detail: firebaseProbe.error || "Firebase probe failed.",
      });
    } else {
      const { publicKeyOk, adminOk, configured } = firebaseProbe.result;
      const identityOk = publicKeyOk || adminOk;
      services.push({
        id: "firebase-auth",
        name: "LMS Authentication",
        group: "auth",
        status: !configured ? "down" : identityOk ? "operational" : "degraded",
        latencyMs: firebaseProbe.latencyMs,
        detail: !configured
          ? "FIREBASE_PROJECT_ID is not configured — student login cannot verify tokens."
          : identityOk
            ? "Firebase identity verification is reachable for LMS student sessions."
            : "Firebase credentials present but identity verification failed.",
      });
    }

    // 4) Admin OTP session signing
    const adminSecretOk =
      envConfigured("ADMIN_JWT_SECRET") || envConfigured("NEXTAUTH_SECRET");
    services.push({
      id: "admin-auth",
      name: "Admin Authentication",
      group: "auth",
      status: adminSecretOk ? "operational" : isProduction ? "down" : "degraded",
      latencyMs: null,
      detail: adminSecretOk
        ? "Admin OTP session signing secret is configured."
        : "ADMIN_JWT_SECRET (or NEXTAUTH_SECRET) missing — admin sessions cannot be signed safely.",
    });

    // 5) Email / notifications delivery
    const emailTimed = await timed(() => probeEmailProvider());
    if (emailTimed.ok) {
      const email = emailTimed.result;
      services.push({
        id: "email",
        name: "Email Delivery",
        group: "comms",
        status: !email.configured
          ? "down"
          : email.reachable
            ? "operational"
            : "degraded",
        latencyMs: emailTimed.latencyMs,
        detail: email.detail,
      });
    } else {
      services.push({
        id: "email",
        name: "Email Delivery",
        group: "comms",
        status: "degraded",
        latencyMs: emailTimed.latencyMs,
        detail: emailTimed.error || "Email probe failed.",
      });
    }

    // 6) Cloudinary media
    const cloudTimed = await timed(() => probeCloudinary());
    if (cloudTimed.ok) {
      const cloud = cloudTimed.result;
      services.push({
        id: "cloudinary",
        name: "File Storage",
        group: "media",
        status: !cloud.configured
          ? "degraded"
          : cloud.reachable
            ? "operational"
            : "down",
        latencyMs: cloudTimed.latencyMs,
        detail: cloud.detail,
      });
    } else {
      services.push({
        id: "cloudinary",
        name: "File Storage",
        group: "media",
        status: "down",
        latencyMs: cloudTimed.latencyMs,
        detail: cloudTimed.error || "Cloudinary probe failed.",
      });
    }

    // 7) Frontend / CORS origin (LMS app surface)
    const frontend = getFrontendUrlStatus(isProduction);
    services.push({
      id: "lms-frontend",
      name: "LMS Application Origin",
      group: "core",
      status: !frontend.configured
        ? isProduction
          ? "down"
          : "degraded"
        : isProduction && !frontend.https
          ? "degraded"
          : "operational",
      latencyMs: null,
      detail: frontend.detail,
    });

    // Informational only — GenValue does not run a managed video pipeline
    services.push({
      id: "lesson-media",
      name: "Lesson Media",
      group: "media",
      status: "operational",
      latencyMs: null,
      detail:
        "Lessons use external video URLs (YouTube/Vimeo/Cloudinary/MP4). No managed streaming pipeline to monitor.",
      informational: true,
    });

    const accessSnapshot = await getAdminAccessSnapshot(prisma);
    const missingSecrets = getMissingProductionSecrets();
    const overall = overallFromServices(
      services.filter((s) => !s.informational)
    );

    const counts = {
      operational: services.filter((s) => s.status === "operational").length,
      degraded: services.filter((s) => s.status === "degraded").length,
      down: services.filter((s) => s.status === "down").length,
    };

    res.status(200).json({
      success: true,
      data: {
        overall,
        checkedAt,
        environment: {
          nodeEnv: process.env.NODE_ENV || "development",
          hosting,
          isProduction,
        },
        counts,
        services,
        authSignals: {
          activeAdmins: accessSnapshot.activeAdminCount,
          superAdmins: accessSnapshot.superAdminCount,
          securityAccessCount: accessSnapshot.securityAccessCount,
        },
        secrets: {
          productionReady: !isProduction || missingSecrets.length === 0,
          missingInProduction: isProduction ? missingSecrets : [],
        },
        outOfScope: [
          {
            id: "ai-providers",
            label: "AI Providers",
            reason: "No live AI API is wired into GenValue yet.",
          },
          {
            id: "payments",
            label: "Payment Gateway",
            reason: "Payments are not enabled.",
          },
          {
            id: "host-metrics",
            label: "CPU / Memory / Disk",
            reason: "Host metrics are managed by Vercel/Render, not exposed in-app.",
          },
          {
            id: "job-queues",
            label: "Background Job Queues",
            reason: "No Redis/worker queue is deployed.",
          },
          {
            id: "managed-backups",
            label: "Backup Schedule UI",
            reason: "Database backups are handled by CockroachDB hosting, not by this app.",
          },
        ],
      },
    });
  } catch (error) {
    console.error("[systemHealth] getSystemHealth error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load system health",
    });
  }
}

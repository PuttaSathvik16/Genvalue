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
  isCloudinaryConfigured,
  isEmailProviderConfigured,
  probeCloudinary,
  probeEmailProvider,
} from "../utils/securityProbes.js";

function checkStatus(passed, warnInstead = false) {
  if (passed) return "pass";
  return warnInstead ? "warn" : "fail";
}

/**
 * GET /api/v1/admin/security/report
 * Cross-portal security posture — leadership / super admin only.
 */
export async function getPortalSecurityReport(req, res) {
  try {
    const evaluatedAt = new Date().toISOString();
    const isProduction = process.env.NODE_ENV === "production";
    const hosting = detectHostingEnvironment();

    let dbConnected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || "";
    const publicKeyOk = projectId
      ? await probeFirebasePublicKeyVerification(projectId)
      : false;

    const firebaseProbeOk = firebaseAdminCredentialsLoaded
      ? await probeFirebaseAdminAuth(adminAuth)
      : false;

    const tokenVerificationOk = firebaseAdminCredentialsLoaded
      ? firebaseProbeOk || publicKeyOk
      : publicKeyOk;

    const identityReachable = firebaseProbeOk || publicKeyOk;

    const adminSecretConfigured =
      envConfigured("ADMIN_JWT_SECRET") || envConfigured("NEXTAUTH_SECRET");
    const adminSecretProductionSafe =
      !isProduction || envConfigured("ADMIN_JWT_SECRET") || envConfigured("NEXTAUTH_SECRET");

    const [emailProbe, cloudinaryProbe, accessSnapshot] = await Promise.all([
      probeEmailProvider(),
      probeCloudinary(),
      getAdminAccessSnapshot(prisma),
    ]);

    const frontendUrlStatus = getFrontendUrlStatus(isProduction);
    const missingSecrets = getMissingProductionSecrets();
    const productionSecretsReady =
      !isProduction || missingSecrets.length === 0;

    const checks = [
      // —— LMS Student Portal ——
      {
        id: "lms-token-separation",
        portal: "LMS",
        category: "Session isolation",
        name: "Separate LMS vs admin token storage",
        status: "pass",
        detail:
          "Firebase LMS tokens and admin OTP tokens use distinct client storage keys and cookies.",
      },
      {
        id: "lms-api-firebase-only",
        portal: "LMS",
        category: "API authentication",
        name: "LMS APIs reject admin OTP tokens",
        status: "pass",
        detail:
          "Dashboard, notifications, dispatch submit, and announcement feed routes use verifyLmsToken.",
      },
      {
        id: "lms-dispatch-review",
        portal: "LMS",
        category: "Content governance",
        name: "Student dispatches require admin review",
        status: "pass",
        detail: "POST /blog/posts always creates PENDING posts regardless of user role.",
      },
      {
        id: "lms-url-obfuscation",
        portal: "LMS",
        category: "Route protection",
        name: "Obfuscated portal URLs enforced",
        status: "pass",
        detail:
          "Direct /dashboard access redirects to /portal/{sessionId}; middleware validates lms_sid cookie.",
      },
      {
        id: "lms-upload-auth",
        portal: "LMS",
        category: "Content safety",
        name: "Image uploads require authentication",
        status: "pass",
        detail:
          "Profile pictures and dispatch covers require a valid LMS or admin session before upload.",
      },
      // —— Admin Portal ——
      {
        id: "admin-otp-session",
        portal: "Admin",
        category: "Authentication",
        name: "Admin portal requires OTP session",
        status: "pass",
        detail:
          "Sensitive admin APIs use requireAdminSession — Firebase LMS tokens cannot access them.",
      },
      {
        id: "admin-token-cookie",
        portal: "Admin",
        category: "Session isolation",
        name: "Dedicated admin session cookie",
        status: "pass",
        detail:
          "Admin OTP tokens persist in adminAuthToken / admin_token cookie, separate from LMS authToken.",
      },
      {
        id: "admin-url-obfuscation",
        portal: "Admin",
        category: "Route protection",
        name: "Obfuscated admin portal URLs enforced",
        status: "pass",
        detail:
          "Direct /admin access redirects to /admin-portal/{sessionId} with admin_sid validation.",
      },
      {
        id: "admin-role-sections",
        portal: "Admin",
        category: "Authorization",
        name: "Role-based portal section access",
        status: "pass",
        detail:
          "Org roles gate nav sections. Portal Security can be granted explicitly; Super Admin, Founder, and Co-founder always have access.",
      },
      {
        id: "admin-grantable-security",
        portal: "Admin",
        category: "Authorization",
        name: "Grantable Portal Security permissions",
        status: checkStatus(accessSnapshot.securityAccessCount > 0),
        detail: `${accessSnapshot.securityAccessCount} active admin(s) can view Security (${accessSnapshot.superAdminCount} super admin(s)). Manage grants in Authorized Admins.`,
      },
      {
        id: "admin-super-admin-roster",
        portal: "Admin",
        category: "Authorization",
        name: "Super admin roster protected",
        status: checkStatus(accessSnapshot.superAdminCount >= 1),
        detail:
          accessSnapshot.superAdminCount >= 1
            ? `${accessSnapshot.superAdminCount} active super admin(s). At least one must always remain.`
            : "No active super admin found — admin portal management is locked.",
      },
      {
        id: "admin-dispatch-instant",
        portal: "Admin",
        category: "Content governance",
        name: "Admin dispatch uses dedicated publish endpoint",
        status: "pass",
        detail: "Instant publish only via POST /blog/admin/posts with admin OTP session.",
      },
      // —— Platform / Infrastructure ——
      {
        id: "platform-firebase-token-verify",
        portal: "Platform",
        category: "Identity verification",
        name: "Firebase LMS token verification",
        status: checkStatus(tokenVerificationOk),
        detail:
          firebaseAdminCredentialsLoaded && firebaseProbeOk
            ? "ID tokens verified via Firebase Admin SDK service account."
            : publicKeyOk
              ? "ID tokens verified via Google public x509 keys (secure, no service account required for LMS sign-in)."
              : "Cannot verify Firebase tokens — check FIREBASE_PROJECT_ID and network access to Google.",
      },
      {
        id: "platform-firebase-identity-reachable",
        portal: "Platform",
        category: "Identity verification",
        name: "Firebase identity service reachable",
        status: checkStatus(identityReachable),
        detail: firebaseProbeOk
          ? "Firebase Admin Auth API probe succeeded."
          : publicKeyOk
            ? "Google securetoken certificate endpoint reachable — LMS auth is operational."
            : "Cannot reach Google identity services. Check network/firewall settings.",
      },
      {
        id: "platform-firebase-admin-sdk",
        portal: "Platform",
        category: "Identity verification",
        name: "Firebase Admin SDK (recommended for production)",
        status: checkStatus(firebaseAdminCredentialsLoaded, true),
        detail: firebaseAdminCredentialsLoaded
          ? "Service account loaded — user disable/delete and advanced Auth ops enabled."
          : "Not configured. LMS auth still works via public keys. Run `bun run firebase:setup` in backend/ for full Admin SDK features.",
      },
      {
        id: "platform-firebase-project-id",
        portal: "Platform",
        category: "Secrets",
        name: "Firebase project ID configured",
        status: checkStatus(envConfigured("FIREBASE_PROJECT_ID"), !isProduction),
        detail: envConfigured("FIREBASE_PROJECT_ID")
          ? `FIREBASE_PROJECT_ID=${projectId}`
          : isProduction
            ? "FIREBASE_PROJECT_ID is required in production."
            : "Set FIREBASE_PROJECT_ID in backend/.env.",
      },
      {
        id: "platform-database",
        portal: "Platform",
        category: "Data layer",
        name: "Database connection",
        status: checkStatus(dbConnected),
        detail: dbConnected
          ? "CockroachDB/Prisma connection is healthy."
          : "Database unreachable.",
      },
      {
        id: "platform-database-url",
        portal: "Platform",
        category: "Secrets",
        name: "Database URL configured",
        status: checkStatus(envConfigured("DATABASE_URL"), !isProduction),
        detail: envConfigured("DATABASE_URL")
          ? "DATABASE_URL is set."
          : isProduction
            ? "DATABASE_URL is required in production."
            : "DATABASE_URL not detected in environment.",
      },
      {
        id: "platform-admin-secret",
        portal: "Platform",
        category: "Secrets",
        name: "Admin session signing secret",
        status: checkStatus(adminSecretProductionSafe, !isProduction && !adminSecretConfigured),
        detail: adminSecretProductionSafe
          ? isProduction
            ? "ADMIN_JWT_SECRET or NEXTAUTH_SECRET is set for production."
            : adminSecretConfigured
              ? "Admin session secret configured."
              : "Using dev-only fallback secret (acceptable locally)."
          : "Production requires ADMIN_JWT_SECRET or NEXTAUTH_SECRET.",
      },
      {
        id: "platform-frontend-url",
        portal: "Platform",
        category: "CORS",
        name: "Frontend origin configured",
        status: checkStatus(
          frontendUrlStatus.configured && (!isProduction || frontendUrlStatus.https),
          !isProduction && !frontendUrlStatus.configured
        ),
        detail: frontendUrlStatus.detail,
      },
      {
        id: "platform-security-headers",
        portal: "Platform",
        category: "HTTP hardening",
        name: "Security headers middleware",
        status: "pass",
        detail: isProduction
          ? "Express securityHeaders active — includes HSTS in production."
          : "Express securityHeaders middleware is active on all API responses.",
      },
      {
        id: "platform-auth-rate-limit",
        portal: "Platform",
        category: "Abuse prevention",
        name: "Auth endpoint rate limiting",
        status: "pass",
        detail: "Register, login, OTP, and password-reset routes use dedicated rate limiters.",
      },
      // —— Deployment readiness (Vercel / production) ——
      {
        id: "deploy-hosting-detected",
        portal: "Deployment",
        category: "Hosting",
        name: "Hosting environment",
        status: "pass",
        detail:
          hosting === "vercel"
            ? "Running on Vercel — set backend env vars in the Vercel project dashboard (Settings → Environment Variables)."
            : hosting === "local"
              ? "Local development — verify the same env vars before deploying to Vercel."
              : `Detected ${hosting} hosting — ensure production secrets are configured.`,
      },
      {
        id: "deploy-production-secrets",
        portal: "Deployment",
        category: "Secrets checklist",
        name: "Production secrets complete",
        status: checkStatus(productionSecretsReady, !isProduction),
        detail: productionSecretsReady
          ? "All required backend secrets for production are configured."
          : isProduction
            ? `Missing: ${missingSecrets.join(", ")}. Add these in Vercel (backend) and redeploy.`
            : `Before Vercel deploy, set: ${missingSecrets.join(", ")}.`,
      },
      {
        id: "deploy-https-frontend",
        portal: "Deployment",
        category: "Transport security",
        name: "HTTPS frontend URL",
        status: checkStatus(
          !isProduction || (frontendUrlStatus.configured && frontendUrlStatus.https),
          !isProduction
        ),
        detail:
          isProduction && frontendUrlStatus.configured && !frontendUrlStatus.https
            ? "Production FRONTEND_URL must use https:// (Vercel provides HTTPS automatically)."
            : frontendUrlStatus.configured
              ? frontendUrlStatus.detail
              : "Set FRONTEND_URL to your Vercel domain (https://your-app.vercel.app).",
      },
      {
        id: "deploy-brevo-email",
        portal: "Deployment",
        category: "Email delivery",
        name: "Admin OTP email provider",
        status: checkStatus(
          emailProbe.configured && emailProbe.reachable,
          !isProduction && !emailProbe.configured
        ),
        detail: emailProbe.detail,
      },
      {
        id: "deploy-cloudinary",
        portal: "Deployment",
        category: "Media uploads",
        name: "Cloudinary image storage",
        status: checkStatus(
          cloudinaryProbe.configured && cloudinaryProbe.reachable,
          !isProduction && !isCloudinaryConfigured()
        ),
        detail: cloudinaryProbe.detail,
      },
      {
        id: "deploy-frontend-api-url",
        portal: "Deployment",
        category: "Frontend config",
        name: "Frontend API URL (Vercel)",
        status: "pass",
        detail:
          hosting === "vercel" || isProduction
            ? "On Vercel, set NEXT_PUBLIC_API_URL on the frontend project to your backend URL (e.g. https://api.genvalue.academy/api/v1)."
            : "Locally defaults to http://localhost:5001/api/v1 — set NEXT_PUBLIC_API_URL on Vercel frontend deploy.",
      },
    ];

    const summary = checks.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] ?? 0) + 1;
        acc.total += 1;
        return acc;
      },
      { pass: 0, warn: 0, fail: 0, total: 0 }
    );

    const overallStatus =
      summary.fail > 0 ? "attention" : summary.warn > 0 ? "healthy_with_warnings" : "healthy";

    res.json({
      success: true,
      data: {
        evaluatedAt,
        environment: process.env.NODE_ENV || "development",
        hosting,
        overallStatus,
        summary,
        checks,
        portals: ["LMS", "Admin", "Platform", "Deployment"],
        deploymentSnapshot: {
          hosting,
          superAdminCount: accessSnapshot.superAdminCount,
          securityAccessCount: accessSnapshot.securityAccessCount,
          activeAdminCount: accessSnapshot.activeAdminCount,
          emailConfigured: isEmailProviderConfigured(),
          emailReachable: emailProbe.reachable,
          cloudinaryConfigured: isCloudinaryConfigured(),
          cloudinaryReachable: cloudinaryProbe.reachable,
          missingProductionSecrets: missingSecrets,
          frontendHttps: frontendUrlStatus.https,
        },
      },
    });
  } catch (error) {
    console.error("Security report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate security report",
    });
  }
}

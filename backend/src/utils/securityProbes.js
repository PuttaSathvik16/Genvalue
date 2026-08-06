import cloudinary from "../config/cloudinary.js";
import { adminHasPortalSection } from "../constants/adminPortalRoles.js";
import { verifySmtpConnection } from "../services/emailService.js";

export function envConfigured(key) {
  const value = process.env[key];
  return typeof value === "string" && value.trim().length > 0;
}

export function detectHostingEnvironment() {
  if (process.env.VERCEL === "1") return "vercel";
  if (process.env.RAILWAY_ENVIRONMENT) return "railway";
  if (process.env.NODE_ENV === "production") return "production";
  return "local";
}

const PRODUCTION_SECRET_KEYS = [
  { key: "DATABASE_URL", label: "DATABASE_URL" },
  { key: "ADMIN_JWT_SECRET", label: "ADMIN_JWT_SECRET", alt: "NEXTAUTH_SECRET" },
  { key: "FRONTEND_URL", label: "FRONTEND_URL" },
  { key: "FIREBASE_PROJECT_ID", label: "FIREBASE_PROJECT_ID" },
  { key: "BREVO_SENDER_EMAIL", label: "BREVO_SENDER_EMAIL" },
  { key: "BREVO_SMTP_KEY", label: "BREVO_SMTP_KEY" },
  { key: "BREVO_SMTP_USER", label: "BREVO_SMTP_USER" },
  { key: "CLOUDINARY_CLOUD_NAME", label: "CLOUDINARY_CLOUD_NAME" },
  { key: "CLOUDINARY_API_KEY", label: "CLOUDINARY_API_KEY" },
  { key: "CLOUDINARY_API_SECRET", label: "CLOUDINARY_API_SECRET" },
];

export function getMissingProductionSecrets() {
  return PRODUCTION_SECRET_KEYS.filter(
    (entry) => !envConfigured(entry.key) && !(entry.alt && envConfigured(entry.alt))
  ).map((entry) => entry.label);
}

export function isEmailProviderConfigured() {
  const hasBrevoSmtp =
    envConfigured("BREVO_SMTP_KEY") &&
    envConfigured("BREVO_SMTP_USER") &&
    envConfigured("BREVO_SENDER_EMAIL");
  const hasBrevoApi =
    envConfigured("BREVO_API_KEY") && envConfigured("BREVO_SENDER_EMAIL");
  const hasGmail =
    envConfigured("GMAIL_USER") &&
    envConfigured("GMAIL_APP_PASSWORD") &&
    envConfigured("BREVO_SENDER_EMAIL");
  const devConsole =
    process.env.NODE_ENV !== "production" && process.env.ADMIN_OTP_DEV_CONSOLE === "true";

  return hasBrevoSmtp || hasBrevoApi || hasGmail || devConsole;
}

export async function probeEmailProvider() {
  const configured = isEmailProviderConfigured();

  if (!configured) {
    return {
      configured: false,
      reachable: false,
      detail:
        "Admin OTP login requires Brevo SMTP (BREVO_SMTP_KEY, BREVO_SMTP_USER, BREVO_SENDER_EMAIL) or Brevo API.",
    };
  }

  if (process.env.ADMIN_OTP_DEV_CONSOLE === "true" && process.env.NODE_ENV !== "production") {
    return {
      configured: true,
      reachable: true,
      detail: "Development console OTP mode is active — emails are not sent (local only).",
    };
  }

  const smtpProbe = await verifySmtpConnection();
  if (smtpProbe.ok) {
    return {
      configured: true,
      reachable: true,
      detail: `Brevo SMTP verified on port ${smtpProbe.port} — admin OTP emails can be delivered.`,
    };
  }

  if (envConfigured("BREVO_API_KEY") && envConfigured("BREVO_SENDER_EMAIL")) {
    return {
      configured: true,
      reachable: true,
      detail:
        "Brevo API key configured. Prefer SMTP on Vercel (no IP whitelist). Run backend/scripts/test-smtp.js if delivery fails.",
    };
  }

  return {
    configured: true,
    reachable: false,
    detail: smtpProbe.message || "Email provider configured but SMTP verification failed.",
  };
}

export function isCloudinaryConfigured() {
  return (
    envConfigured("CLOUDINARY_CLOUD_NAME") &&
    envConfigured("CLOUDINARY_API_KEY") &&
    envConfigured("CLOUDINARY_API_SECRET")
  );
}

export async function probeCloudinary() {
  if (!isCloudinaryConfigured()) {
    return {
      configured: false,
      reachable: false,
      detail:
        "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for profile and dispatch cover uploads.",
    };
  }

  try {
    const result = await cloudinary.api.ping();
    const ok = result?.status === "ok";
    return {
      configured: true,
      reachable: ok,
      detail: ok
        ? "Cloudinary API reachable — image uploads are operational."
        : "Cloudinary credentials set but ping failed.",
    };
  } catch (error) {
    return {
      configured: true,
      reachable: false,
      detail: error instanceof Error ? error.message : "Cloudinary ping failed.",
    };
  }
}

export async function getAdminAccessSnapshot(prisma) {
  const activeAdmins = await prisma.authorizedAdmin.findMany({
    where: { isActive: true },
    select: {
      isSuperAdmin: true,
      roles: true,
      portalSections: true,
    },
  });

  const superAdminCount = activeAdmins.filter((admin) => admin.isSuperAdmin).length;
  const securityAccessCount = activeAdmins.filter((admin) =>
    adminHasPortalSection(admin, "SECURITY")
  ).length;

  return {
    superAdminCount,
    securityAccessCount,
    activeAdminCount: activeAdmins.length,
  };
}

export function getFrontendUrlStatus(isProduction) {
  const frontendUrl = process.env.FRONTEND_URL?.trim() || "";
  if (!frontendUrl) {
    return {
      configured: false,
      https: false,
      detail: isProduction
        ? "FRONTEND_URL is required in production for CORS (e.g. https://your-app.vercel.app)."
        : "FRONTEND_URL not set — using localhost defaults in development.",
    };
  }

  const https = frontendUrl.startsWith("https://");
  return {
    configured: true,
    https,
    detail: https
      ? `CORS origin locked to ${frontendUrl}.`
      : isProduction
        ? `FRONTEND_URL must use https:// in production (currently ${frontendUrl}).`
        : `FRONTEND_URL set to ${frontendUrl}.`,
  };
}

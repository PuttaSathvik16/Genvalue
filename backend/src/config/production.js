/**
 * Parse allowed browser origins for CORS.
 * FRONTEND_URL = primary site (emails, redirects).
 * CORS_ORIGINS = optional comma-separated extras (previews, www, etc.).
 */
export function getAllowedCorsOrigins() {
  const primary = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
  const extras = process.env.CORS_ORIGINS?.trim() || "";
  const list = [primary, ...extras.split(",")]
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return [...new Set(list)];
}

/**
 * Fail fast in production when critical env is missing.
 * Returns { ok: true } or { ok: false, missing: string[] }.
 */
export function validateProductionEnv() {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, missing: [] };
  }

  const required = [
    "DATABASE_URL",
    "FRONTEND_URL",
    "ADMIN_JWT_SECRET",
    "FIREBASE_PROJECT_ID",
  ];

  const missing = required.filter((key) => !process.env[key]?.trim());

  const frontendUrl = process.env.FRONTEND_URL?.trim() || "";
  if (frontendUrl && !frontendUrl.startsWith("https://")) {
    missing.push("FRONTEND_URL(must_be_https)");
  }

  const hasBrevoSmtp =
    Boolean(process.env.BREVO_SMTP_KEY?.trim()) &&
    Boolean(process.env.BREVO_SMTP_USER?.trim()) &&
    Boolean(process.env.BREVO_SENDER_EMAIL?.trim());
  const hasBrevoApi =
    Boolean(process.env.BREVO_API_KEY?.trim()) &&
    Boolean(process.env.BREVO_SENDER_EMAIL?.trim());

  if (!hasBrevoSmtp && !hasBrevoApi) {
    missing.push("BREVO_SMTP_or_BREVO_API");
  }

  return { ok: missing.length === 0, missing };
}

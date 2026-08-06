import crypto from "crypto";

const TOKEN_PREFIX = "gva.admin.";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

function getSecret() {
  const secret =
    process.env.ADMIN_JWT_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    "";

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "ADMIN_JWT_SECRET (or NEXTAUTH_SECRET) must be set in production for admin portal sessions."
    );
  }

  return secret || "genvalue-admin-session-secret-dev-only";
}

function signPayload(payloadStr) {
  return crypto.createHmac("sha256", getSecret()).update(payloadStr).digest("base64url");
}

/**
 * Create a signed admin session token (no external JWT dependency).
 */
export function createAdminSessionToken({
  userId,
  email,
  role,
  name,
  isSuperAdmin,
  roles,
  portalSections,
  userLimit,
}) {
  const payload = {
    userId,
    email: email.toLowerCase(),
    role,
    name: name || email.split("@")[0],
    isSuperAdmin: Boolean(isSuperAdmin),
    roles: Array.isArray(roles) ? roles : [],
    portalSections: Array.isArray(portalSections) ? portalSections : [],
    userLimit: userLimit ?? null,
    exp: Date.now() + DEFAULT_TTL_MS,
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");
  const signature = signPayload(payloadStr);

  return `${TOKEN_PREFIX}${payloadB64}.${signature}`;
}

/**
 * Verify admin session token. Returns payload or null.
 */
export function verifyAdminSessionToken(token) {
  if (!token || !token.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  const raw = token.slice(TOKEN_PREFIX.length);
  const dotIndex = raw.lastIndexOf(".");
  if (dotIndex <= 0) {
    return null;
  }

  const payloadB64 = raw.slice(0, dotIndex);
  const signature = raw.slice(dotIndex + 1);

  let payloadStr;
  try {
    payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = signPayload(payloadStr);
  if (signature.length !== expected.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return null;
  }

  if (!payload.exp || payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

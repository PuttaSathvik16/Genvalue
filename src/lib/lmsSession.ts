/** Opaque LMS portal session slug - never put auth tokens in the URL. */

export const LMS_SESSION_ID_KEY = "lmsPortalSessionId";
export const LMS_SESSION_COOKIE = "lms_sid";
const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60; // 30 days

function randomSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}

export function generatePortalSessionId(): string {
  return randomSessionId();
}

export function getStoredPortalSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LMS_SESSION_ID_KEY);
}

export function persistPortalSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LMS_SESSION_ID_KEY, sessionId);
  document.cookie = `${LMS_SESSION_COOKIE}=${sessionId}; path=/; max-age=${SESSION_MAX_AGE_SEC}; SameSite=Strict`;
}

export function clearPortalSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LMS_SESSION_ID_KEY);
  document.cookie = `${LMS_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

/** Map internal dashboard path to obfuscated portal URL. */
export function toPortalPath(sessionId: string, internalPath: string): string {
  const normalized = internalPath.startsWith("/dashboard")
    ? internalPath.slice("/dashboard".length)
    : internalPath.startsWith("/")
      ? internalPath
      : `/${internalPath}`;

  if (!normalized || normalized === "/") {
    return `/portal/${sessionId}`;
  }

  return `/portal/${sessionId}${normalized}`;
}

export function getPortalHomePath(sessionId: string): string {
  return `/portal/${sessionId}`;
}

export function extractPortalSessionId(pathname: string): string | null {
  const match = pathname.match(/^\/portal\/([^/]+)/);
  return match?.[1] ?? null;
}

/** Internal rewrite target for middleware (portal URL → dashboard route). */
export function portalPathToDashboard(pathname: string): string | null {
  const match = pathname.match(/^\/portal\/[^/]+(\/.*)?$/);
  if (!match) return null;
  const suffix = match[1] ?? "";
  if (!suffix || suffix === "/") return "/dashboard";
  return `/dashboard${suffix}`;
}

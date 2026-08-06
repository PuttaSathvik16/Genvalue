/** Opaque admin portal session slug - separate from LMS student portal. */

export const ADMIN_SESSION_ID_KEY = "adminPortalSessionId";
export const ADMIN_SESSION_COOKIE = "admin_sid";
const SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60;

function randomSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}

export function generateAdminPortalSessionId(): string {
  return randomSessionId();
}

export function getStoredAdminPortalSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_SESSION_ID_KEY);
}

export function persistAdminPortalSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_SESSION_ID_KEY, sessionId);
  document.cookie = `${ADMIN_SESSION_COOKIE}=${sessionId}; path=/; max-age=${SESSION_MAX_AGE_SEC}; SameSite=Strict`;
}

export function clearAdminPortalSessionId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_ID_KEY);
  document.cookie = `${ADMIN_SESSION_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

/** Map internal /admin path to obfuscated admin portal URL. */
export function toAdminPortalPath(sessionId: string, internalPath: string): string {
  const normalized = internalPath.startsWith("/admin")
    ? internalPath.slice("/admin".length)
    : internalPath.startsWith("/")
      ? internalPath
      : `/${internalPath}`;

  if (!normalized || normalized === "/") {
    return `/admin-portal/${sessionId}`;
  }

  return `/admin-portal/${sessionId}${normalized}`;
}

export function getAdminPortalHomePath(sessionId: string): string {
  return `/admin-portal/${sessionId}`;
}

export function extractAdminPortalSessionId(pathname: string): string | null {
  const match = pathname.match(/^\/admin-portal\/([^/]+)/);
  return match?.[1] ?? null;
}

/** Internal rewrite target for proxy (admin portal URL → /admin route). */
export function adminPortalPathToAdmin(pathname: string): string | null {
  const match = pathname.match(/^\/admin-portal\/[^/]+(\/.*)?$/);
  if (!match) return null;
  const suffix = match[1] ?? "";
  if (!suffix || suffix === "/") return "/admin";
  return `/admin${suffix}`;
}

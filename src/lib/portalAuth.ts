import { getStoredPortalSessionId } from "@/lib/lmsSession";
import {
  getAuthToken,
  getAuthTokenWithRefresh,
  isAdminPortalToken,
  restoreLmsSessionIfNeeded,
} from "@/services/authService";

/**
 * Resolve a usable LMS portal token after refresh/HMR without forcing logout.
 * Returns null only when there is no persisted session to restore.
 */
export async function ensurePortalAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  await restoreLmsSessionIfNeeded();

  const sessionId = getStoredPortalSessionId();
  const existing = getAuthToken();

  if (!sessionId && !existing) return null;

  const token = await getAuthTokenWithRefresh();
  if (token && !isAdminPortalToken(token)) return token;

  if (existing && !isAdminPortalToken(existing)) return existing;

  return null;
}

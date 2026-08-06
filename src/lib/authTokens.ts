/** Shared auth token constants — keep LMS (Firebase) and admin (OTP) sessions separate. */

export const ADMIN_TOKEN_PREFIX = "gva.admin.";

/** Firebase LMS token (localStorage + cookie). */
export const LMS_AUTH_TOKEN_KEY = "authToken";

/** Admin OTP session token (localStorage + cookie). */
export const ADMIN_AUTH_TOKEN_KEY = "adminAuthToken";
export const ADMIN_AUTH_COOKIE = "admin_token";

export function isAdminTokenValue(token?: string | null): token is string {
  return !!token && token.startsWith(ADMIN_TOKEN_PREFIX);
}

export function isLmsFirebaseToken(token?: string | null): boolean {
  return !!token && !token.startsWith(ADMIN_TOKEN_PREFIX);
}

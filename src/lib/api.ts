/**
 * Central API base URL - always prefer /api/v1 for versioned routes.
 * Legacy /api/* remains mounted on the backend for backward compatibility.
 */
const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

/** Normalize to versioned base (append /v1 if legacy /api URL is configured). */
export function getApiBaseUrl(): string {
  const trimmed = rawBase.replace(/\/+$/, "");
  if (trimmed.endsWith("/api")) {
    return `${trimmed}/v1`;
  }
  return trimmed;
}

export const API_URL = getApiBaseUrl();

/** Friendly message when the backend process is not running locally. */
export function wrapBackendFetchError(err: unknown, fallback: string): Error {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return new Error(
      "Cannot reach the backend API at localhost:5001. Start it with: cd backend && bun run dev"
    );
  }
  if (err instanceof Error) return err;
  return new Error(fallback);
}

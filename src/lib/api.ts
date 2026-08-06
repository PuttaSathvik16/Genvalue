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

/** Friendly message when the backend process is not running. */
export function wrapBackendFetchError(err: unknown, fallback: string): Error {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    const base = getApiBaseUrl();
    const isLocal = /localhost|127\.0\.0\.1/.test(base);
    return new Error(
      isLocal
        ? "Cannot reach the backend API at localhost:5001. Start it with: bun run dev:backend (or bun run dev:full)."
        : `Cannot reach the backend API (${base}). Check that the Render service is live and NEXT_PUBLIC_API_URL is correct.`,
    );
  }
  if (err instanceof Error) return err;
  return new Error(fallback);
}

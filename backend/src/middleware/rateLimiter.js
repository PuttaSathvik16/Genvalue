/**
 * In-memory sliding-window rate limiter (no external dependency).
 * Suitable for single-instance dev/staging; use Redis-backed limiter in multi-instance production.
 */

const buckets = new Map();

function pruneBuckets() {
  if (buckets.size < 10_000) return;
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [key, entry] of buckets) {
    if (entry.start < cutoff) buckets.delete(key);
  }
}

export function createRateLimiter({
  windowMs = 60_000,
  max = 100,
  keyFn = (req) => req.ip || req.socket?.remoteAddress || "unknown",
  message = "Too many requests. Please try again later.",
}) {
  return (req, res, next) => {
    pruneBuckets();

    const key = keyFn(req);
    const now = Date.now();
    let entry = buckets.get(key);

    if (!entry || now - entry.start >= windowMs) {
      entry = { start: now, count: 0 };
    }

    entry.count += 1;
    buckets.set(key, entry);

    const remaining = Math.max(0, max - entry.count);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));

    if (entry.count > max) {
      const retryAfterSec = Math.ceil((entry.start + windowMs - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      return res.status(429).json({ success: false, message });
    }

    return next();
  };
}

/** General API traffic */
export const apiRateLimit = createRateLimiter({
  windowMs: 60_000,
  max: 120,
  message: "Too many API requests. Slow down and try again.",
});

/** Login, register, token verify */
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60_000,
  max: 25,
  keyFn: (req) => `${req.ip || "unknown"}:auth:${req.path}`,
  message: "Too many authentication attempts. Try again in 15 minutes.",
});

/** Admin + student OTP endpoints */
export const otpRateLimit = createRateLimiter({
  windowMs: 15 * 60_000,
  max: 8,
  keyFn: (req) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    return `${req.ip || "unknown"}:otp:${email || req.path}`;
  },
  message: "Too many OTP requests. Please wait before requesting another code.",
});

/** Password reset completion */
export const passwordResetRateLimit = createRateLimiter({
  windowMs: 15 * 60_000,
  max: 10,
  keyFn: (req) => `${req.ip || "unknown"}:pwd-reset:${req.path}`,
  message: "Too many password reset attempts. Try again later.",
});

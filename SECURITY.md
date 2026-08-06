# GenValue Academy — Security Checklist Audit

Last updated: 2026-08-05  
Scope: **Student LMS portal** (`/auth`, `/dashboard`) + **Admin portal** (`/admin`)

---

## 0. Global system prompt

**Status: Done** — Security rules added to `.cursorrules` for all future AI-assisted development.

---

## 1. Leaked secrets scan

| Finding | Severity | Action |
|--------|----------|--------|
| Firebase client config uses `NEXT_PUBLIC_*` env vars only | OK | Expected — Firebase web API keys are public by design; restrict via Firebase console rules |
| Backend secrets (`BREVO_*`, `CLOUDINARY_*`, `ADMIN_JWT_SECRET`) read from env | OK | Never committed in source |
| Default admin session secret in dev | Fixed | Production now **requires** `ADMIN_JWT_SECRET` or `NEXTAUTH_SECRET` |
| `.env` in repo | Warning | Ensure `.env` is gitignored; use `.env.example` for templates |

**Frontend rule:** Only `NEXT_PUBLIC_*` variables may appear in client bundles. All other secrets stay in `backend/.env`.

---

## 2. Input sanitization (XSS & SQL injection)

| Area | Status | Notes |
|------|--------|-------|
| Prisma ORM queries | OK | Parameterized by default |
| Raw SQL in schema migrations | OK | Static DDL only; user input uses `$1` placeholders in OTP lookups |
| Text fields (name, feedback) | Improved | `sanitizeText()` strips HTML tags |
| Email fields | Improved | `normalizeEmail()` validates format |
| PDF submission URLs | Improved | `sanitizeHttpUrl()` — HTTP/HTTPS only, blocks `javascript:` / `data:` |
| Email HTML templates | OK | `escapeHtml()` on dynamic values |
| Firebase token verification | Fixed | Production requires `adminAuth.verifyIdToken()` — no unsigned JWT trust |

**Remaining:** Discussion posts and announcements should adopt `sanitizeText()` on create/update (follow-up).

---

## 3. Rate limiting

| Endpoint group | Limit | Middleware |
|----------------|-------|------------|
| General API | 120 req / min / IP | `apiRateLimit` |
| Auth (login, register, verify-token) | 25 / 15 min / IP | `authRateLimit` |
| OTP (admin + student forgot-password) | 8 / 15 min / IP+email | `otpRateLimit` |
| Password reset completion | 10 / 15 min / IP | `passwordResetRateLimit` |

**Note:** In-memory limiter suits single-instance dev. Use Redis (`express-rate-limit` + Redis store) for horizontal production scaling.

---

## 4. Authentication architecture

| Portal | Mechanism | Status |
|--------|-----------|--------|
| **Student LMS** | Firebase Auth (email/password + Google) | OK — managed service |
| **Admin** | Brevo OTP → HMAC-signed session token | OK — no custom password hashing |
| **Legacy** | NextAuth route exists (`/api/auth/[...nextauth]`) | Review — not primary path; consider removing if unused |

Password reset: OTP email → short-lived reset token → Firebase Admin `updateUser({ password })`.

**Production requirement:** Configure Firebase service account (`FIREBASE_SERVICE_ACCOUNT` or `GOOGLE_APPLICATION_CREDENTIALS`) for token verification and password reset.

---

## 5. API versioning

| Route | Status |
|-------|--------|
| `/api/v1/*` | **Canonical** — all routes mounted here |
| `/api/*` | Legacy alias (backward compatible) |
| Frontend `src/lib/api.ts` | Normalizes base URL to `/api/v1` |

Set `NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1` in `.env`.

---

## 6. File uploads

| Upload type | Validation | Storage |
|-------------|------------|---------|
| Profile picture (base64) | MIME whitelist (jpeg/png/webp/gif), 5 MB max, no SVG | Cloudinary CDN |
| Assignment PDF | URL only (no server file write) | External link |
| Module editor assets | URL fields only | External link |

No local executable upload directory exists — good.

---

## 7. Dependency review

### Frontend (`package.json`)

| Package | Assessment |
|---------|------------|
| `firebase` | Active — primary student auth |
| `next-auth` + `@next-auth/prisma-adapter` | **Redundant** if Firebase is sole auth — candidate for removal after confirming no production use |
| `bcryptjs` | **Likely unused** with Firebase — candidate for removal |
| `@prisma/client` in frontend | Unusual — only needed if Next.js API routes query DB directly |

### Backend (`backend/package.json`)

| Package | Assessment |
|---------|------------|
| `firebase` + `firebase-admin` | Required |
| `prisma` + `@prisma/client` | Required |
| `cloudinary` | Required for profile images |
| `nodemailer` | Required (Brevo SMTP fallback) |
| `express`, `cors`, `body-parser` | Standard — keep updated |

**Action:** Run `npm audit` / `bun audit` before each release. Pin major versions in production.

---

## Security headers (both portals)

Applied on all API responses via `securityHeaders` middleware:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (production only)

---

## Pre-production checklist

- [ ] Set strong `ADMIN_JWT_SECRET` (32+ random bytes)
- [ ] Configure Firebase service account on backend
- [ ] Restrict Firebase API key to your domains in Google Cloud Console
- [ ] Set `FRONTEND_URL` to production origin (CORS)
- [ ] Enable Redis rate limiting for multi-instance deploys
- [ ] Confirm `.env` files are not in git
- [ ] Run `npm audit fix` on frontend and backend

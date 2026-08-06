const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Strip HTML tags and trim — mitigates stored XSS in text fields. */
export function sanitizeText(value, maxLength = 5000) {
  if (value == null) return "";
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function normalizeEmail(raw) {
  const email = sanitizeText(raw, 320).toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return null;
  }
  return email;
}

export function validatePassword(password, minLength = 6) {
  if (typeof password !== "string" || password.length < minLength) {
    return { ok: false, message: `Password must be at least ${minLength} characters.` };
  }
  if (password.length > 128) {
    return { ok: false, message: "Password is too long." };
  }
  return { ok: true };
}

export function validateOtp(raw) {
  const digits = String(raw ?? "").replace(/\D/g, "");
  const otp = digits.length > 6 ? digits.slice(-6) : digits;
  if (otp.length !== 6) {
    return { ok: false, message: "Enter a valid 6-digit code." };
  }
  return { ok: true, otp };
}

/** Safe HTTP(S) URL for student PDF links — blocks javascript: and data: URIs. */
export function sanitizeHttpUrl(raw, maxLength = 2048) {
  const value = sanitizeText(raw, maxLength);
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

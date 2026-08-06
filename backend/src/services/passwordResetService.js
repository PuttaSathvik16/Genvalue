import crypto from "crypto";
import { prisma } from "../config/database.js";
import { adminAuth } from "../config/firebase.js";
import { firebaseAdminCredentialsLoaded } from "../utils/firebaseAdminAuth.js";
import { sendTransactionalEmail } from "./emailService.js";
import {
  buildPasswordResetOtpEmailHtml,
  buildPasswordResetOtpEmailText,
} from "../templates/passwordResetOtpEmail.js";
import {
  normalizeEmail,
  validatePassword,
  validateOtp,
} from "../utils/inputValidation.js";

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;
const RESEND_COOLDOWN_MS = 30 * 1000;

function normalizeOtpCode(raw) {
  const result = validateOtp(raw);
  return result.ok ? result.otp : "";
}

function otpsMatch(stored, input) {
  const a = normalizeOtpCode(stored);
  const b = normalizeOtpCode(input);
  if (a.length !== 6 || b.length !== 6) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

function canUseEmailPassword(user) {
  if (!user?.firebaseUid) return false;
  const providers = user.linkedProviders ?? [];
  return (
    user.authProvider === "EMAIL" ||
    user.authProvider === "BOTH" ||
    providers.includes("EMAIL")
  );
}

async function deleteResetRecord(email) {
  const normalized = normalizeEmail(email);
  await prisma.passwordResetOTP.deleteMany({ where: { email: normalized } }).catch(() => {});
}

async function findResetRecordByEmail(email) {
  return prisma.passwordResetOTP.findUnique({
    where: { email: normalizeEmail(email) },
  });
}

async function findResetRecordByToken(resetToken) {
  return prisma.passwordResetOTP.findFirst({
    where: { resetToken },
  });
}

export async function requestPasswordResetOtp(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return { ok: false, status: 400, message: "A valid email address is required." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return {
      ok: false,
      status: 404,
      message: "No account found with this email. Please register first.",
    };
  }

  if (!canUseEmailPassword(user)) {
    return {
      ok: false,
      status: 400,
      message: "This account uses Google sign-in. Please use Sign In with Google instead.",
    };
  }

  const existing = await findResetRecordByEmail(email);
  if (existing && new Date(existing.expiresAt) > new Date()) {
    const ageMs = Date.now() - new Date(existing.createdAt).getTime();
    if (ageMs < RESEND_COOLDOWN_MS) {
      return {
        ok: true,
        status: 200,
        message: "A code was just sent. Check your inbox (and spam). Use the most recent email.",
      };
    }
  }

  const otp = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await deleteResetRecord(email);
  await prisma.passwordResetOTP.create({
    data: {
      email,
      otp,
      expiresAt,
      verified: false,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  const displayName = user.name || email.split("@")[0];
  const emailResult = await sendTransactionalEmail({
    to: { email, name: displayName },
    subject: "GenValue Academy — Password Reset Code",
    htmlContent: buildPasswordResetOtpEmailHtml({
      otp,
      email,
      expiresMinutes: OTP_EXPIRY_MINUTES,
    }),
    textContent: buildPasswordResetOtpEmailText({
      otp,
      email,
      expiresMinutes: OTP_EXPIRY_MINUTES,
    }),
  });

  if (!emailResult.ok) {
    await deleteResetRecord(email);
    return {
      ok: false,
      status: 502,
      message: "Failed to send reset code to your email. Please try again in a moment.",
      hint: emailResult.hint,
    };
  }

  return {
    ok: true,
    status: 200,
    message:
      emailResult.channel === "dev-console"
        ? "Reset code generated. Check the backend terminal (dev mode)."
        : "Reset code sent. Check your email.",
    channel: emailResult.channel,
  };
}

export async function verifyPasswordResetOtp(rawEmail, rawOtp) {
  const email = normalizeEmail(rawEmail);
  if (!email) {
    return { ok: false, status: 400, message: "A valid email address is required." };
  }

  const otpResult = validateOtp(rawOtp);
  if (!otpResult.ok) {
    return { ok: false, status: 400, message: otpResult.message };
  }
  const otp = otpResult.otp;

  const record = await findResetRecordByEmail(email);
  if (!record) {
    return {
      ok: false,
      status: 400,
      message: "Reset code not found or expired. Please request a new one.",
    };
  }

  if (new Date(record.expiresAt) < new Date()) {
    await deleteResetRecord(email);
    return {
      ok: false,
      status: 400,
      message: "Reset code has expired. Please request a new one.",
    };
  }

  if (!otpsMatch(record.otp, otp)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid code. Use the code from your most recent email, or request a new one.",
    };
  }

  const resetToken = generateResetToken();
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

  await prisma.passwordResetOTP.update({
    where: { email },
    data: {
      verified: true,
      resetToken,
      resetTokenExpiresAt,
    },
  });

  return {
    ok: true,
    status: 200,
    message: "Code verified. You can now set a new password.",
    data: { resetToken, email },
  };
}

export async function resetPasswordWithToken({ resetToken, password, confirmPassword }) {
  if (!resetToken?.trim()) {
    return { ok: false, status: 400, message: "Reset session expired. Please start again." };
  }

  if (!password || !confirmPassword) {
    return { ok: false, status: 400, message: "Password and confirmation are required." };
  }

  if (password !== confirmPassword) {
    return { ok: false, status: 400, message: "Passwords do not match." };
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    return { ok: false, status: 400, message: passwordCheck.message };
  }

  const record = await findResetRecordByToken(resetToken.trim());
  if (!record?.verified || !record.resetTokenExpiresAt) {
    return { ok: false, status: 400, message: "Reset session expired. Please start again." };
  }

  if (new Date(record.resetTokenExpiresAt) < new Date()) {
    await deleteResetRecord(record.email);
    return { ok: false, status: 400, message: "Reset session expired. Please start again." };
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } });
  if (!user?.firebaseUid || !canUseEmailPassword(user)) {
    await deleteResetRecord(record.email);
    return { ok: false, status: 400, message: "Unable to reset password for this account." };
  }

  if (!firebaseAdminCredentialsLoaded) {
    return {
      ok: false,
      status: 503,
      message: "Password reset is temporarily unavailable. Please contact support.",
    };
  }

  try {
    await adminAuth.updateUser(user.firebaseUid, { password });
  } catch (error) {
    console.error("[passwordReset] Firebase updateUser error:", error);
    let message = "Failed to update password. Please try again.";
    if (error.code === "auth/weak-password") {
      message = "Password is too weak. Use at least 6 characters.";
    }
    return { ok: false, status: 400, message };
  }

  await deleteResetRecord(record.email);

  return {
    ok: true,
    status: 200,
    message: "Password updated successfully. You can now sign in with your new password.",
  };
}

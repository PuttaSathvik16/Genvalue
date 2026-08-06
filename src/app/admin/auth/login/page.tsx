"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowRight, FaEnvelope, FaShieldHalved, FaKey } from "react-icons/fa6";
import { sendAdminOTP, verifyAdminOTP } from "@/services/authService";
import { clearStaleNonAdminTokens, getAdminPortalRedirect } from "@/services/adminService";

const ADMIN_OTP_EMAIL_KEY = "adminOtpEmail";
const ADMIN_OTP_STEP_KEY = "adminOtpStep";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeOtp(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length > 6 ? digits.slice(-6) : digits;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentOtpEmail, setSentOtpEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    clearStaleNonAdminTokens();

    const savedEmail = sessionStorage.getItem(ADMIN_OTP_EMAIL_KEY);
    const savedStep = sessionStorage.getItem(ADMIN_OTP_STEP_KEY);
    if (savedEmail && savedStep === "otp") {
      setEmail(savedEmail);
      setSentOtpEmail(savedEmail);
      setStep("otp");
      setSuccessMessage("Enter the 6-digit code sent to your email.");
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const normalizedEmail = normalizeEmail(email);
      const response = await sendAdminOTP(normalizedEmail);

      if (!response.success) {
        setError(
          response.status === 401
            ? response.message || "Unauthorized. This email is not authorized for admin access."
            : response.message || "Failed to send OTP. Please try again."
        );
        return;
      }

      setEmail(normalizedEmail);
      setSentOtpEmail(normalizedEmail);
      sessionStorage.setItem(ADMIN_OTP_EMAIL_KEY, normalizedEmail);
      sessionStorage.setItem(ADMIN_OTP_STEP_KEY, "otp");
      setStep("otp");
      setSuccessMessage("A 6-digit code has been sent to your email. Check your inbox.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const verifyEmail = normalizeEmail(sentOtpEmail || email);
      const normalizedOtp = normalizeOtp(otp);
      const response = await verifyAdminOTP(verifyEmail, normalizedOtp);

      if (!response.success) {
        setError(response.message || "Invalid OTP. Please try again.");
        return;
      }

      sessionStorage.removeItem(ADMIN_OTP_EMAIL_KEY);
      sessionStorage.removeItem(ADMIN_OTP_STEP_KEY);
      router.push(getAdminPortalRedirect(response.data?.portalSessionId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    setOtp("");
    setSuccessMessage("");

    try {
      const normalizedEmail = normalizeEmail(sentOtpEmail || email);
      const response = await sendAdminOTP(normalizedEmail);

      if (response.success) {
        setSentOtpEmail(normalizedEmail);
        sessionStorage.setItem(ADMIN_OTP_EMAIL_KEY, normalizedEmail);
        sessionStorage.setItem(ADMIN_OTP_STEP_KEY, "otp");
        setSuccessMessage("A new code has been sent to your email.");
      } else {
        setError(response.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#EDE6D3] px-4 py-16 text-[#2A2A28] dark:bg-[#070B19] dark:text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:24px_24px] dark:opacity-[0.07] dark:[background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-black/10 bg-[#F6F1E4] p-8 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-10"
      >
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="GenValue home">
            <div className="relative h-10 w-10">
              <Image src="/Genvalue Light.svg" alt="GenValue Logo" fill className="object-contain dark:hidden" priority />
              <Image src="/Genvalue Dark.svg" alt="GenValue Logo" fill className="hidden object-contain dark:block" priority />
            </div>
            <span className="font-display-custom text-2xl font-extrabold tracking-tight">
              <span className="text-[#2A2A28] dark:text-white">Gen</span>
              <span className="text-[#1E3FE0] dark:text-[#60A5FA]">Value</span>
            </span>
          </Link>

          <div className="mt-4 flex items-center justify-center gap-2">
            <FaShieldHalved className="h-6 w-6 text-[#10B981]" />
            <h1 className="font-display-custom text-2xl font-extrabold tracking-tight sm:text-3xl">
              Admin Portal Access
            </h1>
          </div>

          <p className="mt-1 text-xs font-medium text-[#6B6558] dark:text-slate-400">
            {step === "email"
              ? "Enter your authorized admin email to receive a one-time passcode"
              : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Admin Email Address
              </label>
              <div className="relative mt-1.5">
                <FaEnvelope className="absolute left-4 top-3.5 h-4 w-4 text-[#6B6558] dark:text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  aria-label="Admin email address"
                  className="w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 py-3 text-sm font-medium outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-label="Send one-time passcode"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1E3FE0] px-6 text-sm font-bold uppercase tracking-wider text-white shadow-xl transition hover:bg-[#12266E] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]"
            >
              {loading ? "Sending OTP..." : "Send One-Time Passcode"}
              <FaArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-[#1E3FE0]/20 bg-[#1E3FE0]/10 p-3 text-xs font-semibold text-[#1E3FE0] dark:text-[#60A5FA]">
                {successMessage}
              </div>
            )}

            <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/10 p-3 text-xs font-medium text-[#10B981]">
              OTP sent to: <strong>{sentOtpEmail}</strong>
            </div>

            <div>
              <label htmlFor="admin-otp" className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                Enter 6-Digit Code
              </label>
              <div className="relative mt-1.5">
                <FaKey className="absolute left-4 top-3.5 h-4 w-4 text-[#6B6558] dark:text-slate-400" />
                <input
                  id="admin-otp"
                  type="text"
                  inputMode="numeric"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  aria-label="6-digit OTP code"
                  className="w-full rounded-2xl border border-black/10 bg-white pl-11 pr-4 py-3 text-center text-2xl font-bold tracking-widest outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:focus:border-[#60A5FA]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              aria-label="Verify OTP and sign in"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1E3FE0] px-6 text-sm font-bold uppercase tracking-wider text-white shadow-xl transition hover:bg-[#12266E] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]"
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
              <FaArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setError("");
                  setSuccessMessage("");
                  sessionStorage.removeItem(ADMIN_OTP_EMAIL_KEY);
                  sessionStorage.removeItem(ADMIN_OTP_STEP_KEY);
                }}
                aria-label="Change email address"
                className="font-bold text-[#6B6558] hover:text-[#2A2A28] dark:text-slate-400 dark:hover:text-white"
              >
                ← Change Email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                aria-label="Resend OTP code"
                className="font-bold text-[#1E3FE0] hover:underline disabled:opacity-50 dark:text-[#60A5FA]"
              >
                Resend Code
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-[#6B6558] dark:text-slate-400">
          <Link href="/auth/login" className="font-bold text-[#1E3FE0] hover:underline dark:text-[#60A5FA]">
            ← Back to Student/Instructor Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

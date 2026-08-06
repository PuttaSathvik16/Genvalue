"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FaCircleCheck,
  FaImage,
  FaTriangleExclamation,
  FaXmark,
} from "react-icons/fa6";
import { submitBugReport } from "@/services/bugReportService";
import type { BugReportCategory } from "@/types/bugReport";
import { BUG_REPORT_CATEGORY_LABELS } from "@/types/bugReport";

const CATEGORIES = Object.keys(BUG_REPORT_CATEGORY_LABELS) as BugReportCategory[];
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface BugReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read screenshot file"));
    reader.readAsDataURL(file);
  });
}

export function BugReportModal({ open, onClose, onSubmitted }: BugReportModalProps) {
  const reduceMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<BugReportCategory>("BUG");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (open && typeof window !== "undefined") {
      setPageUrl(window.location.href);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, submitting]);

  const resetForm = () => {
    setCategory("BUG");
    setTitle("");
    setDescription("");
    setPageUrl(typeof window !== "undefined" ? window.location.href : "");
    setScreenshotPreview(null);
    setScreenshotBase64(null);
    setScreenshotName("");
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const handleScreenshotChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      setScreenshotPreview(null);
      setScreenshotBase64(null);
      setScreenshotName("");
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Screenshot must be JPEG, PNG, WebP, or GIF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_SCREENSHOT_BYTES) {
      setError("Screenshot must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setScreenshotPreview(dataUrl);
      setScreenshotBase64(dataUrl);
      setScreenshotName(file.name);
    } catch {
      setError("Could not read the selected screenshot.");
    }
  };

  const clearScreenshot = () => {
    setScreenshotPreview(null);
    setScreenshotBase64(null);
    setScreenshotName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await submitBugReport({
        category,
        title,
        description,
        pageUrl: pageUrl || undefined,
        screenshotBase64: screenshotBase64 ?? undefined,
      });

      setSuccess("Report submitted. Our technical team has been notified.");
      onSubmitted?.();

      window.setTimeout(() => {
        resetForm();
        onClose();
      }, 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={handleClose}
          role="presentation"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bug-report-modal-title"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-annotation text-[10px] font-bold uppercase tracking-widest text-red-500">
                  Report a bug
                </span>
                <h2
                  id="bug-report-modal-title"
                  className="mt-1 font-display-custom text-xl font-extrabold text-[#2A2A28] dark:text-white"
                >
                  Tell us what went wrong
                </h2>
                <p className="mt-1 text-xs font-medium text-[#6B6558] dark:text-slate-400">
                  Our technical team (Super Admin, CTO, CPO) will review your report.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                aria-label="Close bug report form"
                className="rounded-full p-2 text-[#6B6558] transition hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
              >
                <FaXmark className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {error ? (
              <div
                className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </div>
            ) : null}

            {success ? (
              <div
                className="mt-4 flex items-start gap-2 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 p-3 text-sm font-bold text-[#10B981]"
                role="status"
              >
                <FaCircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {success}
              </div>
            ) : null}

            <form onSubmit={(event) => void handleSubmit(event)} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="bug-modal-category"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]"
                >
                  Issue type
                </label>
                <select
                  id="bug-modal-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value as BugReportCategory)}
                  aria-label="Issue type"
                  className={inputClass}
                >
                  {CATEGORIES.map((key) => (
                    <option key={key} value={key}>
                      {BUG_REPORT_CATEGORY_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="bug-modal-title"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]"
                >
                  Short title <span className="text-red-500">*</span>
                </label>
                <input
                  id="bug-modal-title"
                  type="text"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Quiz page shows blank after submit"
                  aria-label="Bug report title"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="bug-modal-description"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]"
                >
                  What happened? <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bug-modal-description"
                  required
                  rows={5}
                  maxLength={5000}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Steps to reproduce, error messages, browser/device if relevant…"
                  aria-label="Bug report description"
                  className={`${inputClass} min-h-[120px] resize-y`}
                />
              </div>

              <div>
                <label
                  htmlFor="bug-modal-page-url"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]"
                >
                  Page URL (optional)
                </label>
                <input
                  id="bug-modal-page-url"
                  type="url"
                  value={pageUrl}
                  onChange={(event) => setPageUrl(event.target.value)}
                  placeholder="https://…"
                  aria-label="Page where the issue occurred"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="bug-modal-screenshot"
                  className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558]"
                >
                  Screenshot (optional)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Choose screenshot image"
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-black/10 bg-white/60 px-4 text-xs font-bold text-[#2A2A28] transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white"
                  >
                    <FaImage className="h-3.5 w-3.5" aria-hidden />
                    Upload screenshot
                  </button>
                  {screenshotName ? (
                    <button
                      type="button"
                      onClick={clearScreenshot}
                      aria-label="Remove screenshot"
                      className="text-xs font-bold text-red-600 dark:text-red-400"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                <input
                  ref={fileInputRef}
                  id="bug-modal-screenshot"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(event) => void handleScreenshotChange(event)}
                  className="sr-only"
                  aria-label="Screenshot file upload"
                />
                <p className="mt-2 text-[11px] font-medium text-[#6B6558] dark:text-slate-400">
                  JPEG, PNG, WebP, or GIF · max 5 MB
                </p>
                {screenshotPreview ? (
                  <div className="relative mt-3 overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
                    <Image
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      width={640}
                      height={360}
                      unoptimized
                      className="h-auto max-h-48 w-full object-contain bg-black/5 dark:bg-white/5"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  aria-label="Cancel bug report"
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 px-6 text-sm font-bold text-[#6B6558] transition hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !!success}
                  aria-label="Submit bug report"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  <FaTriangleExclamation className="h-4 w-4" aria-hidden />
                  {submitting ? "Sending…" : "Submit report"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

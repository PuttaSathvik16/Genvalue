"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "genvalue-cookie-consent";
const CHANGE_EVENT = "genvalue-cookie-consent-change";

function consentAccepted(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "accepted";
  } catch {
    return false;
  }
}

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(CHANGE_EVENT, handler);
  };
}

/** True when the dismissible banner should be visible (user has not accepted). */
function getSnapshot(): boolean {
  return !consentAccepted();
}

function getServerSnapshot(): boolean {
  return false;
}

export function CookieConsent() {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] border-t border-zinc-200 bg-white/95 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md md:p-5 dark:border-white/10 dark:bg-[#0D1B2A]/95 dark:shadow-[0_-8px_32px_rgba(0,0,0,0.45)]"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      suppressHydrationWarning
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="min-w-0">
          <h2 id="cookie-consent-title" className="text-base font-semibold text-zinc-900 dark:text-white">
            Cookies & privacy
          </h2>
          <p id="cookie-consent-desc" className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-slate-400">
            This site uses basic browser storage only - including temporary cache files your browser creates while you
            browse, and a small local preference so this notice stays dismissed. We do not run paid marketing or
            analytics consent platforms; this banner is for transparency.{" "}
            <Link
              href="/privacy-policy"
              className="font-medium text-[#2563EB] underline decoration-[#2563EB]/40 underline-offset-2 hover:decoration-[#2563EB] dark:text-[#60A5FA]"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#F59E0B] px-6 text-sm font-semibold text-[#0D1B2A] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
            aria-label="Accept cookies and dismiss banner"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:border-white/20 dark:text-slate-200 dark:hover:bg-white/10 dark:focus-visible:outline-white"
            aria-label="Dismiss cookie notice without changing preferences"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

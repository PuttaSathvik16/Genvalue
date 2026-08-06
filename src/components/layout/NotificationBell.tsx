"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { FaBell } from "react-icons/fa6";

const STORAGE_KEY = "genvalue-notifications-read-ids" as const;
const READ_CHANGE_EVENT = "genvalue-notifications-read-change" as const;

export type GenValueNotification = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly href?: string;
  readonly hrefLabel?: string;
};

const NOTIFICATIONS: readonly GenValueNotification[] = [
  {
    id: "cohort-2026",
    title: "2026 cohort is open",
    body: "AI Tools Mastery is enrolling now - 12 weeks, 40+ tools, 11 categories, practical deliverables.",
    href: "/courses",
    hrefLabel: "View Courses",
  },
  {
    id: "promo-video",
    title: "New promo on the Courses page",
    body: "Watch the GenValue intro video to see how we teach judgment-first AI tool selection.",
    href: "/courses",
    hrefLabel: "Watch on Courses",
  },
  {
    id: "syllabus-pdf",
    title: "Syllabus PDF available",
    body: "Download the full AI Tools Mastery syllabus from the header or Contact page.",
    href: "/syllabus",
    hrefLabel: "Open syllabus",
  },
  {
    id: "blog-insights",
    title: "Fresh insights on the blog",
    body: "Practical posts on choosing assistants, workflows, and automation - updated regularly.",
    href: "/blog",
    hrefLabel: "Read blog",
  },
  {
    id: "contact-replies",
    title: "Questions? We reply within 24 hours",
    body: "Use the Contact form for program details, cohort timing, or team training inquiries.",
    href: "/contact",
    hrefLabel: "Contact us",
  },
] as const;

function readStoredRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function parseStoredRaw(raw: string): Set<string> {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function persistIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    window.dispatchEvent(new Event(READ_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

function subscribeReadIds(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === STORAGE_KEY) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(READ_CHANGE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(READ_CHANGE_EVENT, onCustom);
  };
}

function getServerSnapshot(): string {
  return "";
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();

  const readRaw = useSyncExternalStore(subscribeReadIds, readStoredRaw, getServerSnapshot);
  const readIds = useMemo(() => parseStoredRaw(readRaw), [readRaw]);

  const unreadCount = useMemo(
    () => NOTIFICATIONS.filter((n) => !readIds.has(n.id)).length,
    [readIds],
  );

  const markAllRead = useCallback(() => {
    const next = new Set(readIds);
    for (const n of NOTIFICATIONS) next.add(n.id);
    persistIds(next);
  }, [readIds]);

  const markOneRead = useCallback(
    (id: string) => {
      if (readIds.has(id)) return;
      const next = new Set(readIds);
      next.add(id);
      persistIds(next);
    },
    [readIds],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={listId}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 shadow-sm transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
        onClick={() => setOpen((o) => !o)}
      >
        <FaBell className="h-5 w-5" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 inline-flex min-h-[0.625rem] min-w-[0.625rem] items-center justify-center rounded-full bg-[#F59E0B] px-1 text-[0.625rem] font-bold leading-none text-[#0D1B2A] ring-2 ring-white dark:ring-[#0D1B2A]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={listId}
          role="dialog"
          aria-label="GenValue notifications"
          className="absolute right-0 z-[120] mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl ring-1 ring-zinc-200/80 dark:border-white/10 dark:bg-[#0D1B2A] dark:ring-white/10"
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Updates</p>
            <button
              type="button"
              className="text-xs font-semibold text-[#2563EB] underline-offset-2 hover:underline dark:text-[#60A5FA]"
              onClick={markAllRead}
            >
              Mark all read
            </button>
          </div>
          <ul className="max-h-[min(70vh,420px)] divide-y divide-zinc-100 overflow-y-auto dark:divide-white/10">
            {NOTIFICATIONS.map((n) => {
              const unread = !readIds.has(n.id);
              return (
                <li key={n.id}>
                  <article
                    className={`px-4 py-3 text-left ${unread ? "bg-[#2563EB]/5 dark:bg-[#2563EB]/10" : ""}`}
                  >
                    {n.href ? (
                      <Link
                        href={n.href}
                        className="block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                        onClick={() => {
                          markOneRead(n.id);
                          setOpen(false);
                        }}
                      >
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{n.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-slate-400">{n.body}</p>
                        {n.hrefLabel ? (
                          <p className="mt-2 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                            {n.hrefLabel}
                          </p>
                        ) : null}
                      </Link>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{n.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-slate-400">{n.body}</p>
                      </>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

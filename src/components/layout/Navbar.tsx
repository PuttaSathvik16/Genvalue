"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { SiteLogoMark } from "@/components/layout/SiteLogoMark";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { EnrollNowLink } from "@/components/ui/EnrollNowLink";
import { SITE } from "@/lib/constants";
import { applyLiquidGlass } from "@/lib/liquid-glass";

export type NavItem = {
  readonly label: string;
  readonly href: string;
};

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Instructors", href: "/instructors" },
  { label: "Dispatch", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  const updateScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    let rafId = 0;
    const syncFromScrollPosition = () => {
      rafId = requestAnimationFrame(() => updateScroll());
    };
    syncFromScrollPosition();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateScroll);
    };
  }, [updateScroll]);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = navContainerRef.current;
    if (!el) return;
    const instance = applyLiquidGlass(el, {
      scale: -132,
      chroma: 8,
      border: 0.08,
      mapBlur: 14,
      blur: 3,
      saturate: 1.45,
      fallbackBlur: 18,
    });
    instance.refresh();
    requestAnimationFrame(() => instance.refresh());
    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-6">
      <div
        ref={navContainerRef}
        className={`liquid-glass-navbar mx-auto flex max-w-[1240px] items-center justify-between gap-4 rounded-full px-5 py-2.5 transition-all duration-300 ${
          scrolled
            ? "shadow-[0_14px_35px_rgba(20,20,20,0.18)] dark:shadow-[0_14px_35px_rgba(0,0,0,0.6)]"
            : "shadow-md"
        }`}
      >
        {/* Brand */}
        <Link
          href="/"
          aria-label="GenValue - Home"
          className="flex shrink-0 items-center gap-2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8622E]"
        >
          <SiteLogoMark className="h-7 w-auto sm:h-8" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden items-center gap-3.5 text-xs font-semibold uppercase tracking-wider text-[#6B6558] dark:text-slate-300 md:flex xl:gap-5"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-[#2A2A28] dark:hover:text-white ${
                  active ? "font-bold text-[#1E3FE0] underline underline-offset-4 dark:text-[#60A5FA]" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Pop Accent CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <NotificationBell />

          <EnrollNowLink
            aria-label="Enroll in AI Tools Mastery"
            className="hidden rounded-full bg-[#E8622E] px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#d55321] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8622E] sm:inline-flex sm:items-center sm:justify-center"
          >
            Enroll Now
          </EnrollNowLink>

          <span className="group relative hidden lg:inline-flex" title="Download Syllabus">
            <DownloadButton
              href={SITE.syllabusPdfUrl}
              filename={SITE.syllabusDownloadFilename}
              label="Download Syllabus"
              variant="ghost"
              size="sm"
              iconOnly
              trackingLabel="Download Syllabus"
            />
          </span>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-[#2A2A28] transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E8622E] dark:text-white dark:hover:bg-white/10 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? "Close main navigation menu" : "Open main navigation menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence initial={false}>
        {mobileOpen ? (
          <motion.div
            id={menuId}
            key="mobile-panel"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto mt-2 max-w-[960px] overflow-hidden rounded-3xl border border-zinc-200 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0D1B2A]/95 md:hidden"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile primary">
              {NAV_ITEMS.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-[#1E3FE0]/10 text-[#1E3FE0] dark:bg-white/10 dark:text-white"
                        : "text-[#2A2A28] hover:bg-zinc-100 dark:text-slate-200 dark:hover:bg-white/5"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <EnrollNowLink
                onClick={closeMobileMenu}
                aria-label="Enroll in AI Tools Mastery program"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-[#E8622E] px-4 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#d55321]"
              >
                Enroll Now
              </EnrollNowLink>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

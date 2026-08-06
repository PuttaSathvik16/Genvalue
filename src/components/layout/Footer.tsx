"use client";

import Link from "next/link";
import { SiteLogoMark } from "@/components/layout/SiteLogoMark";
import { useId, useState, type FormEvent } from "react";
import { FaLinkedin, FaXTwitter, FaYoutube, FaInstagram } from "react-icons/fa6";
import { SITE } from "@/lib/constants";

export type QuickLinkItem = {
  readonly label: string;
  readonly href: string;
  readonly downloadFilename?: string;
};

const QUICK_LINKS: readonly QuickLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Syllabus", href: "/syllabus" },
  {
    label: "Download Syllabus",
    href: SITE.syllabusPdfUrl,
    downloadFilename: SITE.syllabusDownloadFilename,
  },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "The Dispatch", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

type SocialNetwork = "linkedin" | "x" | "youtube" | "instagram";

const SOCIAL_LINKS: ReadonlyArray<{
  readonly id: SocialNetwork;
  readonly href: string;
  readonly label: string;
  readonly Icon: typeof FaLinkedin;
}> = [
  {
    id: "linkedin",
    href: SITE.socials.linkedin,
    label: "GenValue on LinkedIn",
    Icon: FaLinkedin,
  },
  {
    id: "x",
    href: "https://x.com/",
    label: "GenValue on X",
    Icon: FaXTwitter,
  },
  {
    id: "youtube",
    href: "https://www.youtube.com/",
    label: "GenValue on YouTube",
    Icon: FaYoutube,
  },
  {
    id: "instagram",
    href: "https://www.instagram.com/",
    label: "GenValue on Instagram",
    Icon: FaInstagram,
  },
] as const;

const CONTACT_EMAIL = "genvalue.academy@gmail.com" as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const formId = useId();

  const handleSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmail("");
  };

  return (
    <footer className="relative mt-24 overflow-hidden bg-[#1E3FE0] text-white dark:bg-[#070B19]">
      {/* Main Footer Container */}
      <div className="relative z-10 bg-black/20 px-6 py-16 sm:px-8 lg:px-12">
        {/* Giant Background Low-Opacity Wordmark */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-display-custom text-[20vw] font-extrabold text-white/[0.04] select-none uppercase tracking-tighter"
        >
          GENVALUE
        </div>

        <div className="relative z-20 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* 1. Brand + tagline */}
            <div className="flex flex-col gap-4">
              <Link href="/" aria-label="GenValue - Home" className="flex items-center gap-2">
                <SiteLogoMark className="h-8 w-auto" />
              </Link>
              <p className="text-sm leading-relaxed text-[#DFE3F7]">
                Online learning at the speed of curiosity - not lectures. Choosing the right AI tool for every task.
              </p>
              <ul className="flex items-center gap-3">
                {SOCIAL_LINKS.map(({ id, href, label, Icon }) => (
                  <li key={id}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-[#E8622E]"
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Quick Links */}
            <div>
              <h4 className="font-annotation text-xs font-bold uppercase tracking-wider text-[#E8622E]">
                QUICK LINKS
              </h4>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {QUICK_LINKS.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    {item.downloadFilename ? (
                      <a
                        href={item.href}
                        download={item.downloadFilename}
                        className="text-[#DFE3F7] transition hover:text-white"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-[#DFE3F7] transition hover:text-white"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Contact Details */}
            <div>
              <h4 className="font-annotation text-xs font-bold uppercase tracking-wider text-[#E8622E]">
                CONTACT
              </h4>
              <ul className="mt-4 flex flex-col gap-3 text-sm">
                <li>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#B9C0E6]">
                    Email
                  </span>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="break-all font-semibold text-white underline underline-offset-4 hover:text-[#E8622E]"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#B9C0E6]">
                    Co-Founder & Instructor
                  </span>
                  <p className="font-semibold text-white">Sathvik Putta</p>
                </li>
              </ul>
            </div>

            {/* 4. Newsletter Subscription */}
            <div>
              <h4 className="font-annotation text-xs font-bold uppercase tracking-wider text-[#E8622E]">
                NEWSLETTER
              </h4>
              <p className="mt-2 text-xs text-[#DFE3F7]">
                Get weekly AI tool frameworks and cohort updates.
              </p>
              <form id={formId} onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2.5">
                <label htmlFor={`${formId}-email`} className="sr-only">
                  Email address
                </label>
                <input
                  id={`${formId}-email`}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#E8622E]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#E8622E] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#d55321]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center text-xs text-[#B9C0E6] sm:flex-row sm:text-left">
            <p>© 2026 GenValue. All rights reserved.</p>
            <nav className="flex gap-4" aria-label="Legal">
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
              <span>|</span>
              <Link href="/terms-of-service" className="hover:text-white">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

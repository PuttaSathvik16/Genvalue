"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaBell,
  FaBug,
  FaChevronRight,
  FaEnvelope,
  FaGear,
  FaUserGear,
} from "react-icons/fa6";
import { BugReportModal } from "@/components/dashboard/BugReportModal";
import { SettingsPageSkeleton } from "@/components/skeletons";
import { useLmsPortalPath } from "@/hooks/useLmsPortalPath";
import { SITE } from "@/lib/constants";

const SETTINGS_SECTIONS = [
  {
    title: "Account",
    description: "Update your profile, photo, and personal details.",
    href: "/dashboard/profile",
    label: "My Profile",
    Icon: FaUserGear,
  },
  {
    title: "Notifications",
    description: "View course updates, announcements, and activity alerts.",
    href: "/dashboard/notifications",
    label: "Notification center",
    Icon: FaBell,
  },
] as const;

export default function StudentSettingsPage() {
  const { toPortal } = useLmsPortalPath();
  const [loading] = useState(false);
  const [bugModalOpen, setBugModalOpen] = useState(false);

  if (loading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#1E3FE0] dark:text-[#60A5FA]">
            ★ LMS SETTINGS
          </span>
          <h1 className="font-display-custom mt-1 text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 text-sm font-medium text-[#6B6558] dark:text-slate-400">
            Manage your account, notifications, and get help when something breaks in the LMS.
          </p>
        </div>

        <section className="space-y-3" aria-labelledby="settings-account-heading">
          <h2
            id="settings-account-heading"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400"
          >
            <FaGear className="h-3.5 w-3.5" aria-hidden />
            Your account
          </h2>

          <div className="space-y-3">
            {SETTINGS_SECTIONS.map(({ title, description, href, label, Icon }, index) => (
              <motion.div
                key={href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={toPortal(href)}
                  aria-label={label}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-black/10 bg-[#F6F1E4] p-5 shadow-xl transition hover:border-[#1E3FE0]/30 dark:border-white/10 dark:bg-[#0D1B2A] dark:hover:border-[#60A5FA]/30"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E3FE0]/10 text-[#1E3FE0] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#2A2A28] dark:text-white">{title}</p>
                      <p className="mt-1 text-xs font-medium text-[#6B6558] dark:text-slate-400">
                        {description}
                      </p>
                    </div>
                  </div>
                  <FaChevronRight
                    className="h-4 w-4 shrink-0 text-[#6B6558] transition group-hover:translate-x-0.5 dark:text-slate-400"
                    aria-hidden
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section
          className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8"
          aria-labelledby="settings-help-heading"
        >
          <h2
            id="settings-help-heading"
            className="text-lg font-bold text-[#2A2A28] dark:text-white"
          >
            Help & support
          </h2>
          <p className="mt-2 text-sm font-medium text-[#6B6558] dark:text-slate-400">
            Found a bug, broken page, or login issue? Report it with details and an optional
            screenshot. Reports appear in the admin portal for the technical team.
          </p>

          <button
            type="button"
            onClick={() => setBugModalOpen(true)}
            aria-label="Report a bug or issue"
            className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-700 dark:bg-red-500 dark:shadow-red-500/20 dark:hover:bg-red-600"
          >
            <FaBug className="h-4 w-4" aria-hidden />
            Report Bug
          </button>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
            <FaEnvelope className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3FE0] dark:text-[#60A5FA]" aria-hidden />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
                General questions
              </p>
              <a
                href={`mailto:${SITE.email}`}
                aria-label={`Email ${SITE.email}`}
                className="mt-1 text-sm font-bold text-[#1E3FE0] hover:underline dark:text-[#60A5FA]"
              >
                {SITE.email}
              </a>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-black/10 p-5 text-center dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
            GenValue Academy
          </p>
          <p className="mt-1 text-sm font-medium text-[#2A2A28] dark:text-white">{SITE.tagline}</p>
        </section>
      </div>

      <BugReportModal open={bugModalOpen} onClose={() => setBugModalOpen(false)} />
    </>
  );
}

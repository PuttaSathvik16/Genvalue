"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaShieldHalved,
  FaUserGear,
  FaUserShield,
} from "react-icons/fa6";
import {
  getAdminPortalSettings,
  getAdminProfile,
  type AdminPortalSettings,
  type AdminProfile,
} from "@/services/adminService";
import { getOrgRoleLabel } from "@/lib/adminRoles";
import { useAdminPortalPath } from "@/hooks/useAdminPortalPath";
import { SettingsPageSkeleton } from "@/components/skeletons";

const PORTAL_SECTION_LABELS: Record<string, string> = {
  ANALYTICS: "Analytics",
  STUDENTS: "Student Roster",
  ANNOUNCEMENTS: "Announcements",
  AUDIT_LOGS: "System Audit Logs",
};

function getAccessibleSections(profile: AdminProfile): string[] {
  if (profile.isSuperAdmin) {
    return Object.values(PORTAL_SECTION_LABELS);
  }

  const sections = new Set<string>();
  const roleAccess: Record<string, string[]> = {
    FOUNDER: ["ANALYTICS", "STUDENTS", "ANNOUNCEMENTS", "AUDIT_LOGS"],
    COFOUNDER: ["ANALYTICS", "STUDENTS", "ANNOUNCEMENTS", "AUDIT_LOGS"],
    CTO: ["ANALYTICS", "STUDENTS", "ANNOUNCEMENTS", "AUDIT_LOGS"],
    CPO: ["ANALYTICS", "STUDENTS", "ANNOUNCEMENTS", "AUDIT_LOGS"],
    INSTRUCTOR: ["STUDENTS", "ANNOUNCEMENTS"],
  };

  for (const role of profile.roles ?? []) {
    for (const section of roleAccess[role] ?? []) {
      sections.add(PORTAL_SECTION_LABELS[section] ?? section);
    }
  }

  return [...sections];
}

export default function AdminSettingsPage() {
  const { toPortal } = useAdminPortalPath();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [portalSettings, setPortalSettings] = useState<AdminPortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const adminProfile = await getAdminProfile();
        if (!adminProfile) {
          setError("Could not load admin profile.");
          return;
        }
        setProfile(adminProfile);

        if (adminProfile.isSuperAdmin) {
          const settings = await getAdminPortalSettings();
          setPortalSettings(settings);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <SettingsPageSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm font-bold text-red-600 dark:text-red-400">
        {error || "Profile unavailable"}
      </div>
    );
  }

  const accessibleSections = getAccessibleSections(profile);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
          ★ ADMIN SETTINGS
        </span>
        <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
          Account & Portal
        </h1>
        <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
          Your admin identity, access permissions, and security settings.
        </p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#2A2A28] dark:text-white">
          <FaUserGear className="h-4 w-4 text-[#1E3FE0]" />
          Profile
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558]">Name</dt>
            <dd className="mt-1 text-sm font-bold text-[#2A2A28] dark:text-white">{profile.name}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558]">Email</dt>
            <dd className="mt-1 flex items-center gap-2 text-sm font-bold text-[#2A2A28] dark:text-white">
              <FaEnvelope className="h-3.5 w-3.5 text-[#1E3FE0]" />
              {profile.email}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558]">Portal role</dt>
            <dd className="mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#10B981]">
                <FaShieldHalved className="h-3 w-3" />
                {profile.isSuperAdmin ? "Super Admin" : profile.role}
              </span>
            </dd>
          </div>
          {!profile.isSuperAdmin && profile.userLimit != null && (
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558]">
                Student roster limit
              </dt>
              <dd className="mt-1 text-sm font-bold text-[#2A2A28] dark:text-white">
                {profile.userLimit} students
              </dd>
            </div>
          )}
        </dl>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <h2 className="mb-4 text-lg font-bold text-[#2A2A28] dark:text-white">Organization roles</h2>
        <div className="flex flex-wrap gap-2">
          {(profile.roles ?? []).length > 0 ? (
            profile.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-[#1E3FE0]/10 px-3 py-1 text-xs font-bold uppercase text-[#1E3FE0] dark:bg-[#60A5FA]/15 dark:text-[#60A5FA]"
              >
                {getOrgRoleLabel(role)}
              </span>
            ))
          ) : (
            <p className="text-sm text-[#6B6558] dark:text-slate-400">No org roles assigned.</p>
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <h2 className="mb-4 text-lg font-bold text-[#2A2A28] dark:text-white">Portal access</h2>
        <ul className="space-y-2">
          {accessibleSections.map((section) => (
            <li
              key={section}
              className="flex items-center gap-2 rounded-xl border border-black/10 bg-white/40 px-4 py-2.5 text-sm font-semibold text-[#2A2A28] dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <span className="h-2 w-2 rounded-full bg-[#10B981]" aria-hidden="true" />
              {section}
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#2A2A28] dark:text-white">
          <FaLock className="h-4 w-4 text-[#E8622E]" />
          Security
        </h2>
        <ul className="space-y-3 text-sm text-[#6B6558] dark:text-slate-400">
          <li className="rounded-xl border border-black/10 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="font-bold text-[#2A2A28] dark:text-white">OTP sign-in</p>
            <p className="mt-1 text-xs">
              Admin access uses a one-time passcode sent to your authorized email. Codes expire after
              10 minutes.
            </p>
          </li>
          <li className="rounded-xl border border-black/10 bg-white/40 px-4 py-3 dark:border-white/10 dark:bg-white/5">
            <p className="font-bold text-[#2A2A28] dark:text-white">Session</p>
            <p className="mt-1 text-xs">
              Your admin session is stored securely in this browser. Sign out when using a shared
              device.
            </p>
          </li>
        </ul>
      </motion.section>

      {profile.isSuperAdmin && portalSettings && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-[#E8622E]/20 bg-[#F6F1E4] p-6 shadow-lg dark:border-[#E8622E]/30 dark:bg-[#0D1B2A]"
        >
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[#2A2A28] dark:text-white">
            <FaUserShield className="h-4 w-4 text-[#E8622E]" />
            Super admin controls
          </h2>
          <p className="mb-4 text-sm text-[#6B6558] dark:text-slate-400">
            Admin email limit:{" "}
            <strong className="text-[#2A2A28] dark:text-white">
              {portalSettings.activeAdminCount} / {portalSettings.maxAuthorizedAdmins} slots used
            </strong>
          </p>
          <Link
            href={toPortal("/admin/authorized-admins")}
            aria-label="Manage authorized admin emails"
            className="inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#12266E] dark:bg-[#60A5FA] dark:text-[#070B19]"
          >
            <FaUserShield className="h-4 w-4" />
            Manage Authorized Admins
          </Link>
        </motion.section>
      )}
    </div>
  );
}

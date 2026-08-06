"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBookOpen, FaChartLine, FaCircleCheck, FaClipboardCheck, FaClipboardList, FaUsers } from "react-icons/fa6";
import { DigitalClock } from "@/components/admin/DigitalClock";
import { useAdminPortalPath } from "@/hooks/useAdminPortalPath";
import {
  getAdminAnalytics,
  type AdminAnalytics,
  type AdminAuditLog,
} from "@/services/adminService";
import { AdminDashboardSkeleton } from "@/components/skeletons";

export default function AdminDashboardPage() {
  const { toPortal } = useAdminPortalPath();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getAdminAnalytics();
        if (!cancelled) {
          setAnalytics(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const logs: AdminAuditLog[] = analytics?.recentAuditLogs ?? [];

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div className="min-w-0 flex-1">
          <span className="font-annotation inline-block -rotate-2 text-xs font-bold uppercase tracking-widest text-[#10B981]">
            ★ EXECUTIVE ADMIN DASHBOARD
          </span>
          <h1 className="font-display-custom mt-1 text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Platform Control
          </h1>
          <p className="mt-2 text-xs font-medium text-[#6B6558] dark:text-slate-300 sm:text-sm">
            Monitor real-time student enrollments, completion metrics, and audit activities.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
          <DigitalClock />
          <Link
            href={toPortal("/admin/students")}
            className="inline-flex h-11 items-center justify-center gap-2 self-stretch rounded-full bg-[#10B981] px-6 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#10B981]/20 transition hover:bg-[#0d9668] sm:h-auto sm:self-center sm:py-3.5"
            aria-label="Manage students"
          >
            <FaUsers className="h-4 w-4" />
            <span>Manage {analytics?.studentCount ?? 0} Students</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <Link
          href={toPortal("/admin/courses")}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-4 text-center hover:bg-black/5 dark:border-white/10 dark:bg-[#0D1B2A] dark:hover:bg-white/5"
          aria-label="Manage courses"
        >
          <FaBookOpen className="mx-auto h-6 w-6 text-[#1E3FE0] dark:text-[#60A5FA]" />
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#2A2A28] dark:text-white">Courses</p>
        </Link>

        <Link
          href={toPortal("/admin/assignments")}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-4 text-center hover:bg-black/5 dark:border-white/10 dark:bg-[#0D1B2A] dark:hover:bg-white/5"
          aria-label="Manage assignments"
        >
          <FaClipboardList className="mx-auto h-6 w-6 text-[#E8622E]" />
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#2A2A28] dark:text-white">Assignments</p>
        </Link>

        <Link
          href={toPortal("/admin/quizzes")}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-4 text-center hover:bg-black/5 dark:border-white/10 dark:bg-[#0D1B2A] dark:hover:bg-white/5"
          aria-label="Manage quizzes"
        >
          <FaCircleCheck className="mx-auto h-6 w-6 text-[#10B981]" />
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#2A2A28] dark:text-white">Quizzes</p>
        </Link>

        <Link
          href={toPortal("/admin/submissions")}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-4 text-center hover:bg-black/5 dark:border-white/10 dark:bg-[#0D1B2A] dark:hover:bg-white/5"
          aria-label="Review student submissions"
        >
          <FaClipboardCheck className="mx-auto h-6 w-6 text-[#2563EB] dark:text-[#60A5FA]" />
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#2A2A28] dark:text-white">Submissions</p>
        </Link>

        <Link
          href={toPortal("/admin/announcements")}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-4 text-center hover:bg-black/5 dark:border-white/10 dark:bg-[#0D1B2A] dark:hover:bg-white/5"
          aria-label="Manage announcements"
        >
          <FaChartLine className="mx-auto h-6 w-6 text-[#1E3FE0]" />
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-[#2A2A28] dark:text-white">Announcements</p>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Total Registered</span>
          <p className="font-display-custom mt-2 text-3xl font-extrabold text-[#2A2A28] dark:text-white">
            {analytics?.totalRegistered ?? 0}
          </p>
          <p className="mt-2 text-[10px] font-bold text-[#10B981]">Active LMS Accounts</p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Active Programs</span>
          <p className="font-display-custom mt-2 text-3xl font-extrabold text-[#1E3FE0] dark:text-[#60A5FA]">
            {analytics?.activePrograms ?? 0}
          </p>
          <p className="mt-2 text-[10px] font-bold text-[#1E3FE0] dark:text-[#60A5FA]">
            {analytics?.programLabel ?? "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Submissions Evaluated</span>
          <p className="font-display-custom mt-2 text-3xl font-extrabold text-[#E8622E]">
            {analytics?.submissionsEvaluated ?? 0}
          </p>
          <p className="mt-2 text-[10px] font-bold text-[#E8622E]">Practical Deliverables</p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Completion Rate</span>
          <p className="font-display-custom mt-2 text-3xl font-extrabold text-[#10B981]">
            {`${analytics?.completionRate ?? 0}%`}
          </p>
          <p className="mt-2 text-[10px] font-bold text-[#10B981]">
            {analytics && analytics.completionRate >= 70 ? "Above Industry Benchmark" : "Across active enrollments"}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]">
        <h2 className="font-display-custom text-lg font-extrabold text-[#2A2A28] dark:text-white">Recent System Audit Logs</h2>
        <div className="mt-4 space-y-2">
          {logs.length === 0 && (
            <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">No platform activity recorded yet.</p>
          )}
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-4 text-xs font-medium dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="font-bold text-[#1E3FE0] dark:text-[#60A5FA]">{log.userName}</span>
                <span className="ml-2 font-bold text-[#2A2A28] dark:text-white">{log.action}: {log.details}</span>
              </div>
              <span className="text-[10px] text-[#6B6558] dark:text-slate-400">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

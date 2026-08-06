"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaBug,
  FaCircleCheck,
  FaClock,
  FaRotateRight,
  FaTriangleExclamation,
} from "react-icons/fa6";
import { ListItemsSkeleton } from "@/components/skeletons";
import {
  listAdminBugReports,
  updateAdminBugReport,
} from "@/services/bugReportService";
import type { BugReport, BugReportListMeta, BugReportStatus } from "@/types/bugReport";
import {
  BUG_REPORT_CATEGORY_LABELS,
  BUG_REPORT_STATUS_LABELS,
} from "@/types/bugReport";

const STATUS_FILTERS: { value: "" | BugReportStatus; label: string }[] = [
  { value: "", label: "All" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
];

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminBugReportsPage() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [meta, setMeta] = useState<BugReportListMeta | null>(null);
  const [filter, setFilter] = useState<"" | BugReportStatus>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const { reports: list, meta: listMeta } = await listAdminBugReports(filter || undefined);
      setReports(list);
      setMeta(listMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bug reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const counts = {
    open: meta?.openCount ?? 0,
    inProgress: meta?.inProgressCount ?? 0,
    resolved: Math.max(0, (meta?.total ?? 0) - (meta?.openCount ?? 0) - (meta?.inProgressCount ?? 0)),
  };

  const handleStatusChange = async (report: BugReport, status: BugReportStatus) => {
    setUpdatingId(report.id);
    setError("");

    try {
      const updated = await updateAdminBugReport(report.id, { status });
      setReports((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      void loadReports(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
            ★ STUDENT FEEDBACK
          </span>
          <h1 className="font-display-custom mt-1 text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Bug Reports
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-[#6B6558] dark:text-slate-400">
            Issues submitted from the LMS Settings page. Alert emails go to Super Admin, CTO, and
            CPO — not Founder, Co-founder, or Instructor.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReports(true)}
          disabled={refreshing}
          aria-label="Refresh bug reports"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white/60 px-5 text-xs font-bold uppercase tracking-wider text-[#2A2A28] transition hover:bg-white disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <FaRotateRight className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open" value={counts.open} tone="warn" />
        <StatCard label="In progress" value={counts.inProgress} tone="neutral" />
        <StatCard label="Resolved" value={counts.resolved} tone="pass" />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.value || "all"}
            type="button"
            onClick={() => setFilter(item.value)}
            aria-label={`Filter bug reports: ${item.label}`}
            aria-pressed={filter === item.value}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              filter === item.value
                ? "bg-[#1E3FE0] text-white dark:bg-[#60A5FA] dark:text-[#070B19]"
                : "border border-black/10 bg-white/60 text-[#6B6558] hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]">
        <div className="border-b border-black/10 px-6 py-4 dark:border-white/10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#2A2A28] dark:text-white">
            <FaBug className="h-4 w-4 text-[#F59E0B]" aria-hidden />
            Submitted reports
          </h2>
        </div>

        {loading ? (
          <div className="p-4">
            <ListItemsSkeleton count={4} />
          </div>
        ) : reports.length === 0 ? (
          <div className="p-10 text-center text-sm font-medium text-[#6B6558] dark:text-slate-400">
            No bug reports yet.
          </div>
        ) : (
          <ul className="divide-y divide-black/10 dark:divide-white/10">
            {reports.map((report, index) => (
              <motion.li
                key={report.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="px-6 py-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={report.status} />
                      <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-bold uppercase text-[#6B6558] dark:bg-white/10 dark:text-slate-300">
                        {BUG_REPORT_CATEGORY_LABELS[report.category]}
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-extrabold text-[#2A2A28] dark:text-white">
                      {report.title}
                    </h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-[#6B6558] dark:text-slate-400">
                      {report.description}
                    </p>
                    <p className="mt-3 text-xs font-medium text-[#6B6558] dark:text-slate-400">
                      {report.userName} · {report.userEmail} · {formatWhen(report.createdAt)}
                    </p>
                    {report.pageUrl ? (
                      <p className="mt-1 truncate text-xs text-[#1E3FE0] dark:text-[#60A5FA]">
                        {report.pageUrl}
                      </p>
                    ) : null}
                    {report.screenshotUrl ? (
                      <div className="mt-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
                          Screenshot
                        </p>
                        <a
                          href={report.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View screenshot for ${report.title}`}
                          className="inline-block overflow-hidden rounded-2xl border border-black/10 dark:border-white/10"
                        >
                          <Image
                            src={report.screenshotUrl}
                            alt={`Screenshot attached to bug report: ${report.title}`}
                            width={480}
                            height={270}
                            className="h-auto max-h-56 w-auto max-w-full object-contain bg-black/5 dark:bg-white/5"
                          />
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0">
                    <label htmlFor={`status-${report.id}`} className="sr-only">
                      Update status for {report.title}
                    </label>
                    <select
                      id={`status-${report.id}`}
                      value={report.status}
                      disabled={updatingId === report.id}
                      onChange={(e) =>
                        void handleStatusChange(report, e.target.value as BugReportStatus)
                      }
                      aria-label={`Update status for ${report.title}`}
                      className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-xs font-bold text-[#2A2A28] outline-none focus:border-[#1E3FE0] disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      {(Object.keys(BUG_REPORT_STATUS_LABELS) as BugReportStatus[]).map((key) => (
                        <option key={key} value={key}>
                          {BUG_REPORT_STATUS_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "pass" | "warn" | "neutral";
}) {
  const toneClass =
    tone === "pass"
      ? "text-[#10B981]"
      : tone === "warn"
        ? "text-[#B45309] dark:text-[#FCD34D]"
        : "text-[#2A2A28] dark:text-white";

  return (
    <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-5 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-2 font-display-custom text-3xl font-extrabold ${toneClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: BugReportStatus }) {
  if (status === "RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#10B981]">
        <FaCircleCheck className="h-3 w-3" aria-hidden />
        {BUG_REPORT_STATUS_LABELS[status]}
      </span>
    );
  }

  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#1E3FE0]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#1E3FE0] dark:text-[#60A5FA]">
        <FaClock className="h-3 w-3" aria-hidden />
        {BUG_REPORT_STATUS_LABELS[status]}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#F59E0B]/15 px-2.5 py-1 text-[10px] font-bold uppercase text-[#B45309] dark:text-[#FCD34D]">
      <FaTriangleExclamation className="h-3 w-3" aria-hidden />
      {BUG_REPORT_STATUS_LABELS[status]}
    </span>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClipboardCheck,
  FaArrowUpRightFromSquare,
  FaFilePdf,
  FaFloppyDisk,
  FaListCheck,
  FaXmark,
} from "react-icons/fa6";
import {
  gradeAdminSubmission,
  listAdminSubmissions,
  type AdminSubmissionRecord,
  type AdminSubmissionsMeta,
} from "@/services/adminService";
import { useAdminPortalPath } from "@/hooks/useAdminPortalPath";
import { TableRowsSkeleton } from "@/components/skeletons";

const PAGE_SIZE = 15;

type ReviewFilter = "all" | "pending" | "graded";

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function submissionTypeLabel(type: string): string {
  if (type === "PDF") return "PDF";
  if (type === "MCQ") return "Quiz (MCQ)";
  if (type === "MIXED") return "PDF + Quiz";
  return type;
}

function statusBadge(status: string, needsManualReview: boolean) {
  if (needsManualReview) {
    return {
      label: "Needs review",
      className: "bg-[#F59E0B]/15 text-[#B45309] dark:text-[#F59E0B]",
    };
  }
  if (status === "GRADED") {
    return {
      label: "Graded",
      className: "bg-[#10B981]/15 text-[#0d9668] dark:text-[#10B981]",
    };
  }
  if (status === "SUBMITTED") {
    return {
      label: "Submitted",
      className: "bg-[#2563EB]/15 text-[#1D4ED8] dark:text-[#60A5FA]",
    };
  }
  return {
    label: status,
    className: "bg-black/5 text-[#6B6558] dark:bg-white/10 dark:text-slate-300",
  };
}

function GradePanel({
  submission,
  onClose,
  onGraded,
}: {
  submission: AdminSubmissionRecord;
  onClose: () => void;
  onGraded: (updated: AdminSubmissionRecord) => void;
}) {
  const [grade, setGrade] = useState(
    submission.grade != null ? String(submission.grade) : submission.quizScore != null ? String(submission.quizScore) : ""
  );
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isMcqOnly = submission.submissionType === "MCQ";
  const isMixed = submission.submissionType === "MIXED";
  const isPdfOnly = submission.submissionType === "PDF";

  async function handleSave() {
    const parsedGrade = parseInt(grade, 10);
    if (Number.isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100) {
      setError("Enter a valid grade between 0 and 100.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await gradeAdminSubmission(submission.id, {
        grade: parsedGrade,
        feedback: feedback.trim() || undefined,
      });
      onGraded({ ...submission, ...updated, needsManualReview: false, status: "GRADED" });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save grade");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Evaluate submission from ${submission.user.name ?? submission.user.email}`}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-annotation inline-block -rotate-1 text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Evaluate submission
            </span>
            <h2 className="font-display-custom mt-1 text-xl font-extrabold text-[#2A2A28] dark:text-white">
              {submission.assignment?.title ?? "Assignment"}
            </h2>
            <p className="mt-1 text-sm text-[#6B6558] dark:text-slate-300">
              {submission.user.name ?? "Student"} · {submission.user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#6B6558] hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close evaluation panel"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Type</p>
            <p className="mt-1 font-semibold text-[#2A2A28] dark:text-white">
              {submissionTypeLabel(submission.submissionType)}
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Submitted</p>
            <p className="mt-1 font-semibold text-[#2A2A28] dark:text-white">
              {formatDateTime(submission.submittedAt)}
            </p>
          </div>
        </div>

        {(isPdfOnly || isMixed) && submission.pdfUrl && (
          <div className="mt-4 rounded-2xl border border-[#E8622E]/20 bg-[#E8622E]/5 p-4">
            <div className="flex items-center gap-2">
              <FaFilePdf className="h-5 w-5 text-[#E8622E]" />
              <p className="text-sm font-bold text-[#2A2A28] dark:text-white">PDF submission</p>
            </div>
            <p className="mt-2 text-xs text-[#6B6558] dark:text-slate-400">
              Open the uploaded PDF, review the work, then enter a final grade below.
            </p>
            <a
              href={submission.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#E8622E] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#d45628]"
              aria-label="Open student PDF in new tab"
            >
              <FaArrowUpRightFromSquare className="h-3.5 w-3.5" />
              Open PDF
            </a>
          </div>
        )}

        {(isMcqOnly || isMixed) && submission.quizScore != null && (
          <div className="mt-4 rounded-2xl border border-[#10B981]/20 bg-[#10B981]/5 p-4">
            <div className="flex items-center gap-2">
              <FaListCheck className="h-5 w-5 text-[#10B981]" />
              <p className="text-sm font-bold text-[#2A2A28] dark:text-white">Quiz auto-score</p>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-[#10B981]">{submission.quizScore}%</p>
            {submission.assignment?.passingScore != null && (
              <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">
                Passing score: {submission.assignment.passingScore}%
                {submission.quizScore >= submission.assignment.passingScore ? " · Passed quiz portion" : " · Below passing on quiz"}
              </p>
            )}
            {isMixed && (
              <p className="mt-2 text-xs text-[#6B6558] dark:text-slate-400">
                For mixed assignments, set the final grade after reviewing the PDF. You can average quiz + PDF or override manually.
              </p>
            )}
          </div>
        )}

        {isMcqOnly && submission.status === "GRADED" && (
          <p className="mt-4 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 p-3 text-sm text-[#0d9668] dark:text-[#10B981]">
            This MCQ submission was auto-graded on submit. You can override the grade below if needed.
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="grade-input" className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
              Final grade (0-100)
            </label>
            <input
              id="grade-input"
              type="number"
              min={0}
              max={100}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#2A2A28] outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-[#04050A] dark:text-white"
              aria-label="Final grade percentage"
            />
          </div>

          <div>
            <label htmlFor="feedback-input" className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
              Feedback for student
            </label>
            <textarea
              id="feedback-input"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Comments on the PDF work, areas to improve, etc."
              className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-[#2A2A28] outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-[#04050A] dark:text-white"
              aria-label="Instructor feedback"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-semibold text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0d9668] disabled:opacity-60"
            aria-label="Save grade and feedback"
          >
            <FaFloppyDisk className="h-4 w-4" />
            {saving ? "Saving…" : "Save grade"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#6B6558] hover:bg-black/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            aria-label="Cancel grading"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminSubmissionsPage() {
  const { toPortal } = useAdminPortalPath();
  const [submissions, setSubmissions] = useState<AdminSubmissionRecord[]>([]);
  const [meta, setMeta] = useState<AdminSubmissionsMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [weekFilter, setWeekFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminSubmissionRecord | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await listAdminSubmissions({
        page,
        pageSize: PAGE_SIZE,
        search: search.trim() || undefined,
        week: weekFilter ? parseInt(weekFilter, 10) : undefined,
        type: typeFilter || undefined,
        needsReview: reviewFilter === "pending",
        status: reviewFilter === "graded" ? "GRADED" : undefined,
      });
      setSubmissions(result.submissions);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions");
      setSubmissions([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, weekFilter, typeFilter, reviewFilter]);

  useEffect(() => {
    const timer = setTimeout(loadSubmissions, 300);
    return () => clearTimeout(timer);
  }, [loadSubmissions]);

  useEffect(() => {
    setPage(1);
  }, [search, weekFilter, typeFilter, reviewFilter]);

  function handleGraded(updated: AdminSubmissionRecord) {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  const pendingCount = submissions.filter((s) => s.needsManualReview).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <span className="font-annotation inline-block -rotate-2 text-xs font-bold uppercase tracking-widest text-[#2563EB]">
            ★ SUBMISSION RECORDS
          </span>
          <h1 className="font-display-custom mt-1 text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Evaluate Student Work
          </h1>
          <p className="mt-2 max-w-2xl text-xs font-medium text-[#6B6558] dark:text-slate-300 sm:text-sm">
            Review PDF uploads, see auto-graded quiz scores, and grade mixed submissions from every student account in one place.
          </p>
        </div>
        <Link
          href={toPortal("/admin/assignments")}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#2A2A28] hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          aria-label="Manage assignments"
        >
          Manage assignments
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "all" as const, label: "All submissions" },
            { id: "pending" as const, label: "Pending review" },
            { id: "graded" as const, label: "Graded" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setReviewFilter(tab.id)}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              reviewFilter === tab.id
                ? "bg-[#2563EB] text-white"
                : "border border-black/10 text-[#6B6558] hover:bg-black/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
            }`}
            aria-label={`Filter ${tab.label}`}
            aria-pressed={reviewFilter === tab.id}
          >
            {tab.label}
            {tab.id === "pending" && pendingCount > 0 && reviewFilter !== "pending" ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student name or email…"
          className="rounded-xl border border-black/10 bg-[#F6F1E4] px-4 py-3 text-sm dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white"
          aria-label="Search submissions by student"
        />
        <select
          value={weekFilter}
          onChange={(e) => setWeekFilter(e.target.value)}
          className="rounded-xl border border-black/10 bg-[#F6F1E4] px-4 py-3 text-sm dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white"
          aria-label="Filter by week"
        >
          <option value="">All weeks</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={String(w)}>
              Week {w}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-xl border border-black/10 bg-[#F6F1E4] px-4 py-3 text-sm dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white"
          aria-label="Filter by submission type"
        >
          <option value="">All types</option>
          <option value="PDF">PDF only</option>
          <option value="MCQ">Quiz (MCQ)</option>
          <option value="MIXED">PDF + Quiz</option>
        </select>
        <button
          type="button"
          onClick={() => loadSubmissions()}
          className="rounded-xl border border-black/10 bg-[#F6F1E4] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#2563EB] hover:bg-black/5 dark:border-white/10 dark:bg-[#0D1B2A] dark:hover:bg-white/5"
          aria-label="Refresh submissions list"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-[#F6F1E4] shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
        {loading ? (
          <div className="overflow-x-auto p-4" aria-label="Loading submissions">
            <table className="w-full">
              <tbody>
                <TableRowsSkeleton rows={8} cols={6} />
              </tbody>
            </table>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-12 text-center">
            <FaClipboardCheck className="mx-auto h-10 w-10 text-[#6B6558] dark:text-slate-500" />
            <p className="mt-4 text-sm font-semibold text-[#2A2A28] dark:text-white">No submissions yet</p>
            <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">
              Student assignment submissions will appear here for evaluation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:border-white/10 dark:text-slate-400">
                  <th className="px-4 py-4">Student</th>
                  <th className="px-4 py-4">Assignment</th>
                  <th className="px-4 py-4">Type</th>
                  <th className="px-4 py-4">Quiz score</th>
                  <th className="px-4 py-4">Final grade</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Submitted</th>
                  <th className="px-4 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => {
                  const badge = statusBadge(submission.status, submission.needsManualReview);
                  return (
                    <tr
                      key={submission.id}
                      className="border-b border-black/5 hover:bg-black/[0.02] dark:border-white/5 dark:hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#2A2A28] dark:text-white">
                          {submission.user.name ?? "-"}
                        </p>
                        <p className="text-xs text-[#6B6558] dark:text-slate-400">{submission.user.email}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#2A2A28] dark:text-white">
                          {submission.assignment?.title ?? "-"}
                        </p>
                        {submission.assignment?.week != null && (
                          <p className="text-xs text-[#6B6558] dark:text-slate-400">
                            Week {submission.assignment.week}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                        {submissionTypeLabel(submission.submissionType)}
                      </td>
                      <td className="px-4 py-4">
                        {submission.quizScore != null ? (
                          <span className="font-bold text-[#10B981]">{submission.quizScore}%</span>
                        ) : (
                          <span className="text-[#6B6558] dark:text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {submission.grade != null ? (
                          <span className="font-bold text-[#2A2A28] dark:text-white">{submission.grade}%</span>
                        ) : (
                          <span className="text-[#6B6558] dark:text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-[#6B6558] dark:text-slate-400">
                        {formatDateTime(submission.submittedAt)}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelected(submission)}
                          className="rounded-full bg-[#2563EB] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#1D4ED8]"
                          aria-label={`Evaluate submission from ${submission.user.email}`}
                        >
                          {submission.needsManualReview ? "Review" : "View / Edit"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-black/10 px-4 py-4 dark:border-white/10">
            <p className="text-xs text-[#6B6558] dark:text-slate-400">
              Page {meta.page} of {meta.totalPages} · {meta.total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full border border-black/10 p-2 disabled:opacity-40 dark:border-white/10"
                aria-label="Previous page"
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="rounded-full border border-black/10 p-2 disabled:opacity-40 dark:border-white/10"
                aria-label="Next page"
              >
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <GradePanel
            submission={selected}
            onClose={() => setSelected(null)}
            onGraded={handleGraded}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

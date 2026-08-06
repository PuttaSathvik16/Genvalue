"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaCircleCheck, FaFileCircleCheck, FaPenToSquare } from "react-icons/fa6";
import { lmsStore } from "@/lib/lms-store";

export default function InstructorGradingDeskPage() {
  const [submissions, setSubmissions] = useState(lmsStore.getSubmissions());
  const [selectedSubId, setSelectedSubId] = useState<string | null>(submissions[1]?.id || submissions[0]?.id || null);
  const [points, setPoints] = useState(90);
  const [feedback, setFeedback] = useState("");
  const [gradedSuccess, setGradedSuccess] = useState("");

  const handleGrade = (e: React.FormEvent, subId: string) => {
    e.preventDefault();
    const updated = lmsStore.gradeAssignment(subId, points, feedback, "u-instructor");
    if (updated) {
      setSubmissions([...lmsStore.getSubmissions()]);
      setGradedSuccess(`Successfully graded ${updated.userName} (${points}/100)`);
      setTimeout(() => setGradedSuccess(""), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
          ★ FACULTY EVALUATION DESK
        </span>
        <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
          Assignment Grading Workspace
        </h1>
        <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
          Review student practical deliverables, assign marks, and provide constructive feedback.
        </p>
      </div>

      {gradedSuccess && (
        <div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 p-4 text-xs font-bold text-[#10B981]">
          {gradedSuccess}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Col: Submission Inbox */}
        <div className="space-y-3 lg:col-span-1">
          {submissions.map((sub) => {
            const isSelected = selectedSubId === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubId(sub.id)}
                className={`flex w-full flex-col gap-1 rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-[#E8622E] bg-[#E8622E]/10"
                    : "border-black/10 bg-[#F6F1E4] hover:bg-black/5 dark:border-white/10 dark:bg-[#0D1B2A]"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase">
                  <span className="text-[#1E3FE0] dark:text-[#60A5FA]">{sub.userName}</span>
                  <span className={sub.status === "GRADED" ? "text-[#10B981]" : "text-[#E8622E]"}>
                    {sub.status}
                  </span>
                </div>
                <p className="font-display-custom text-sm font-bold text-[#2A2A28] dark:text-white">{sub.assignmentId.toUpperCase()}</p>
                <p className="line-clamp-1 text-xs text-[#6B6558] dark:text-slate-400">{sub.content}</p>
              </button>
            );
          })}
        </div>

        {/* Right 2 Cols: Submission Detail & Grading Form */}
        <div className="lg:col-span-2">
          {selectedSubId ? (
            (() => {
              const sub = submissions.find((s) => s.id === selectedSubId);
              if (!sub) return null;

              return (
                <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
                  <div className="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
                    <div>
                      <span className="font-annotation text-xs font-bold text-[#E8622E]">★ STUDENT SUBMISSION</span>
                      <h2 className="font-display-custom mt-1 text-xl font-extrabold text-[#2A2A28] dark:text-white sm:text-2xl">
                        {sub.userName} ({sub.userEmail})
                      </h2>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold shadow-sm dark:bg-white/10">
                      {sub.status}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
                        Submission Content & Notes
                      </label>
                      <p className="mt-1 rounded-2xl border border-black/10 bg-white p-4 text-xs font-medium leading-relaxed text-[#2A2A28] dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                        {sub.content}
                      </p>
                    </div>

                    {sub.fileUrl && (
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
                          Attachment Deliverable
                        </label>
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-2 text-xs font-bold text-[#1E3FE0] underline dark:text-[#60A5FA]"
                        >
                          View / Download Submission File ({sub.fileUrl})
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Grading Form */}
                  <form onSubmit={(e) => handleGrade(e, sub.id)} className="mt-8 space-y-4 border-t border-black/10 pt-6 dark:border-white/10">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                        Assign Score (Max 100 Points)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                        className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-xs font-bold outline-none dark:border-white/10 dark:bg-white/5"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">
                        Instructor Feedback & Feedback Notes
                      </label>
                      <textarea
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Write constructive guidance, model recommendations, and code feedback..."
                        className="mt-1.5 w-full rounded-2xl border border-black/10 bg-white p-4 text-xs font-medium outline-none dark:border-white/10 dark:bg-white/5"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full bg-[#E8622E] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-[#d55321]"
                    >
                      <FaCircleCheck className="h-4 w-4" /> Save Score & Send Feedback
                    </button>
                  </form>
                </div>
              );
            })()
          ) : (
            <div className="flex h-64 items-center justify-center rounded-3xl border border-black/10 bg-[#F6F1E4] text-xs font-bold text-[#6B6558] dark:border-white/10 dark:bg-[#0D1B2A]">
              Select a submission from the inbox list to evaluate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

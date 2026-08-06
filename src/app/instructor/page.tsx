"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaBookOpen, FaCircleCheck, FaFileCircleCheck, FaGraduationCap, FaPenToSquare } from "react-icons/fa6";
import { lmsStore } from "@/lib/lms-store";

export default function InstructorDashboardPage() {
  const submissions = lmsStore.getSubmissions();
  const pendingSubmissions = submissions.filter((s) => s.status === "PENDING");
  const users = lmsStore.getUsers().filter((u) => u.role === "STUDENT");

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:flex-row sm:items-center sm:justify-between lg:p-8">
        <div>
          <span className="font-annotation inline-block -rotate-2 text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ INSTRUCTOR FACULTY PANEL
          </span>
          <h1 className="font-display-custom mt-1 text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Faculty Teaching Hub
          </h1>
          <p className="mt-2 text-xs font-medium text-[#6B6558] dark:text-slate-300 sm:text-sm">
            Manage course content, review student practical submissions, and evaluate weekly assessments.
          </p>
        </div>

        <Link
          href="/instructor/assignments"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#E8622E] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-[#d55321]"
        >
          <FaFileCircleCheck className="h-4 w-4" />
          <span>Review {pendingSubmissions.length} Pending Project(s)</span>
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Enrolled Students</span>
          <p className="font-display-custom mt-2 text-3xl font-extrabold text-[#2A2A28] dark:text-white">{users.length + 42}</p>
          <p className="mt-2 text-[10px] font-bold text-[#1E3FE0] dark:text-[#60A5FA]">AI Tools Mastery Program</p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Pending Review</span>
          <p className="font-display-custom mt-2 text-3xl font-extrabold text-[#E8622E]">{pendingSubmissions.length}</p>
          <p className="mt-2 text-[10px] font-bold text-[#E8622E]">Submissions Awaiting Grade</p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">Graded Submissions</span>
          <p className="font-display-custom mt-2 text-3xl font-extrabold text-[#10B981]">
            {submissions.filter((s) => s.status === "GRADED").length + 18}
          </p>
          <p className="mt-2 text-[10px] font-bold text-[#10B981]">Feedback Provided</p>
        </div>
      </div>
    </div>
  );
}

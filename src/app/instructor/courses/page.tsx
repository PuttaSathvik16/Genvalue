"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaBookOpen, FaPlus, FaVideo } from "react-icons/fa6";
import { lmsStore } from "@/lib/lms-store";

export default function InstructorCourseBuilderPage() {
  const [modules, setModules] = useState(lmsStore.getModules());
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState("mod-w1");
  const [newTitle, setNewTitle] = useState("");
  const [newDuration, setNewDuration] = useState("30 mins");
  const [newVideoUrl, setNewVideoUrl] = useState("/videos/genvalue-academy-promo.mp4");

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const targetMod = modules.find((m) => m.id === targetModuleId);
    if (targetMod) {
      targetMod.lessons.push({
        id: `les-${Date.now()}`,
        moduleId: targetModuleId,
        title: newTitle,
        description: "Custom video lesson uploaded by faculty instructor.",
        type: "VIDEO",
        videoUrl: newVideoUrl,
        duration: newDuration,
      });
      setModules([...modules]);
      setNewTitle("");
      setShowAddLesson(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ CURRICULUM MANAGEMENT
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Course Content & Lesson Builder
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Structure modules, upload video lessons, attach PDF cheatsheets, and create quizzes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddLesson(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#E8622E] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-[#d55321]"
        >
          <FaPlus className="h-3.5 w-3.5" /> Add New Lesson
        </button>
      </div>

      {showAddLesson && (
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
          <h3 className="font-display-custom text-lg font-bold text-[#2A2A28] dark:text-white">
            Add Lesson to Module
          </h3>

          <form onSubmit={handleAddLesson} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">Target Module</label>
              <select
                value={targetModuleId}
                onChange={(e) => setTargetModuleId(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white p-3 text-xs font-medium outline-none dark:border-white/10 dark:bg-[#070B19]"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">Lesson Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Advanced Prompting Techniques & Persona Steering"
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white p-3 text-xs font-medium outline-none dark:border-white/10 dark:bg-white/5"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">Video MP4 URL</label>
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white p-3 text-xs font-medium outline-none dark:border-white/10 dark:bg-white/5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300">Duration</label>
                <input
                  type="text"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-black/10 bg-white p-3 text-xs font-medium outline-none dark:border-white/10 dark:bg-white/5"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="rounded-full bg-[#1E3FE0] px-6 py-2.5 text-xs font-bold uppercase text-white shadow-md dark:bg-[#60A5FA] dark:text-[#070B19]"
              >
                Save Lesson
              </button>
              <button
                type="button"
                onClick={() => setShowAddLesson(false)}
                className="rounded-full border border-black/10 bg-white px-6 py-2.5 text-xs font-bold text-[#2A2A28] dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Course Curriculum Tree */}
      <div className="space-y-4">
        {modules.map((mod) => (
          <div key={mod.id} className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]">
            <div className="flex items-center justify-between border-b border-black/10 pb-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E3FE0] text-xs font-bold text-white shadow-md">
                  W{mod.week}
                </span>
                <h3 className="font-display-custom text-base font-extrabold text-[#2A2A28] dark:text-white">{mod.title}</h3>
              </div>
              <span className="text-xs font-bold text-[#6B6558] dark:text-slate-400">{mod.lessons.length} Lessons</span>
            </div>

            <div className="mt-4 space-y-2">
              {mod.lessons.map((les) => (
                <div
                  key={les.id}
                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-3.5 text-xs font-bold dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <FaVideo className="h-4 w-4 text-[#1E3FE0] dark:text-[#60A5FA]" />
                    <span className="text-[#2A2A28] dark:text-slate-200">{les.title}</span>
                  </div>
                  <span className="text-[10px] text-[#6B6558] dark:text-slate-400">{les.duration}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

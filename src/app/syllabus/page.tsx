"use client";

import { course } from "@/data/course";
import type { IconType } from "react-icons";
import {
  FaBolt,
  FaBookOpenReader,
  FaBriefcase,
  FaChevronDown,
  FaCircleCheck,
  FaClipboardList,
  FaCode,
  FaComments,
  FaFlagCheckered,
  FaPenNib,
  FaPenToSquare,
  FaSliders,
} from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { DownloadButton } from "@/components/ui/DownloadButton";
import { EnrollNowLink } from "@/components/ui/EnrollNowLink";
import { SITE } from "@/lib/constants";

const OBJECTIVE_ICONS = [
  FaSliders,
  FaComments,
  FaBolt,
  FaPenNib,
  FaBookOpenReader,
  FaCode,
  FaBriefcase,
] as const satisfies readonly IconType[];

const EVAL_ICONS = [FaClipboardList, FaPenToSquare, FaFlagCheckered] as const;

type ToolEntry = {
  readonly name: string;
  readonly category: string;
  readonly accent: string;
};

function flattenTools(): ToolEntry[] {
  return course.toolCategories.flatMap((cat) =>
    cat.tools.map((name) => ({
      name,
      category: cat.category,
      accent: cat.accent,
    })),
  );
}

const accordionEase = [0.4, 0, 0.2, 1] as [number, number, number, number];

const accordionPanelVariants = {
  open: { height: "auto", opacity: 1 },
  closed: { height: 0, opacity: 0 },
} as const;

export default function SyllabusPage() {
  const allTools = useMemo(() => flattenTools(), []);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [openWeek, setOpenWeek] = useState<number | null>(1);
  const [showStickyEnroll, setShowStickyEnroll] = useState(false);

  const filteredTools = useMemo(() => {
    if (categoryFilter === "all") return allTools;
    return allTools.filter((t) => t.category === categoryFilter);
  }, [allTools, categoryFilter]);

  const capstoneWeek = course.syllabus.find((w) => w.week === 12);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setShowStickyEnroll(window.scrollY > 400);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const toggleWeek = (weekNum: number) => {
    setOpenWeek((prev) => (prev === weekNum ? null : weekNum));
  };

  useEffect(() => {
    if (openWeek === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenWeek(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openWeek]);

  return (
    <div className="relative bg-[#EDE6D3] pb-28 text-[#2A2A28] dark:bg-[#070B19] dark:text-slate-200">
      {/* Blueprint Grid Lines Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:24px_24px] dark:opacity-[0.07] dark:[background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)]"
        aria-hidden="true"
      />

      {/* Hero */}
      <section className="relative mx-auto max-w-[1200px] px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="font-annotation inline-block -rotate-2 text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ OFFICIAL 12-WEEK CURRICULUM
          </span>
          <h1 className="font-display-custom mt-2 text-balance text-4xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-5xl md:text-6xl">
            12-Week Syllabus
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base font-medium leading-relaxed text-[#6B6558] sm:text-lg dark:text-slate-300">
            {course.subtitle}
          </p>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2.5">
            {course.stats.map((stat) => (
              <span
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-bold shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-white"
              >
                <span className="text-[#6B6558] dark:text-slate-400">{stat.label}:</span>
                <span className="text-[#1E3FE0] dark:text-[#60A5FA]">{stat.value}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PDF Download Action Bar */}
      <section className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 text-center shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]">
          <DownloadButton
            href={SITE.syllabusPdfUrl}
            filename={SITE.syllabusDownloadFilename}
            label="Download Full Syllabus PDF"
            variant="gold"
            size="lg"
            trackingLabel="Download full GenValue syllabus PDF"
          />
          <p className="mt-3 text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Free Download · 9 Pages · Official Curriculum PDF
          </p>
        </div>
      </section>

      {/* Learning objectives */}
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-labelledby="syllabus-objectives">
        <div className="mx-auto max-w-7xl">
          <h2
            id="syllabus-objectives"
            className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white"
          >
            Learning Objectives
          </h2>
          <ol className="mt-8 grid gap-4 sm:gap-5">
            {course.learningObjectives.map((objective, index) => {
              const Icon = OBJECTIVE_ICONS[index] ?? FaCircleCheck;
              return (
                <li key={`objective-${index}`}>
                  <div className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:gap-5 sm:p-6 dark:border-white/10 dark:bg-[#0D1B2A]">
                    <div className="flex shrink-0 flex-col items-center gap-2 sm:flex-row sm:items-start">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-sm font-bold text-[#FBBF24] ring-1 ring-zinc-200 dark:bg-white/5 dark:ring-white/10">
                        {index + 1}
                      </span>
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]/15 text-[#2563EB]">
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                    </div>
                    <p className="min-w-0 pt-1 text-sm leading-relaxed text-zinc-700 sm:text-base dark:text-slate-300">
                      {objective}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Tools */}
      <section className="border-t border-zinc-200 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 dark:border-white/10" aria-labelledby="syllabus-tools">
        <div className="mx-auto max-w-7xl">
          <h2 id="syllabus-tools" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
            Tools Covered
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base dark:text-slate-400">
            Filter by category. Every badge uses that category&apos;s accent color.
          </p>

          <div
            className="mt-8 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter tools by category"
          >
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              aria-pressed={categoryFilter === "all"}
              aria-label="Show tools from all categories"
              className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                categoryFilter === "all"
                  ? "bg-[#2563EB] text-white"
                  : "border border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              All categories
            </button>
            {course.toolCategories.map((cat) => (
              <button
                key={cat.category}
                type="button"
                onClick={() => setCategoryFilter(cat.category)}
                aria-pressed={categoryFilter === cat.category}
                aria-label={`Show tools in ${cat.category}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                  categoryFilter === cat.category
                    ? "text-white shadow-lg"
                    : "border border-zinc-300 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:border-white/15 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                }`}
                style={
                  categoryFilter === cat.category
                    ? { backgroundColor: cat.accent }
                    : undefined
                }
              >
                {cat.category}
              </button>
            ))}
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredTools.map((tool) => (
              <li key={`${tool.category}-${tool.name}`}>
                <span
                  className="flex min-h-[2.75rem] items-center rounded-full border border-zinc-200 bg-white px-3 py-2 text-center text-xs font-medium leading-snug text-zinc-900 shadow-sm sm:text-sm dark:border-white/10 dark:bg-[#0D1B2A] dark:text-white"
                  style={{
                    borderLeftWidth: 4,
                    borderLeftColor: tool.accent,
                  }}
                >
                  {tool.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Weekly accordion */}
      <section className="border-t border-zinc-200 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 dark:border-white/10" aria-labelledby="syllabus-weeks">
        <div className="mx-auto max-w-7xl">
          <h2 id="syllabus-weeks" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
            Weekly Breakdown
          </h2>
          <p className="mt-3 text-sm text-zinc-600 sm:text-base dark:text-slate-400">
            Open one week at a time. Expand for concepts, tools, assignment, and use case.
          </p>

          <div className="mt-10 flex flex-col gap-4">
            {course.syllabus.map((w) => {
              const isOpen = openWeek === w.week;
              const weekNum = String(w.week).padStart(2, "0");
              const panelId = `syllabus-week-${w.week}-panel`;
              const triggerId = `syllabus-week-${w.week}-trigger`;
              return (
                <div
                  key={w.week}
                  className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-md dark:border-white/10 dark:bg-[#0D1B2A]"
                >
                  <span
                    className="pointer-events-none absolute -right-2 top-1/2 z-0 -translate-y-1/2 select-none font-black tabular-nums leading-none text-zinc-900/[0.06] sm:right-4 dark:text-white/[0.06]"
                    style={{ fontSize: "clamp(4rem, 18vw, 11rem)" }}
                    aria-hidden
                  >
                    {weekNum}
                  </span>

                  <button
                    id={triggerId}
                    type="button"
                    onClick={() => toggleWeek(w.week)}
                    className="relative z-10 flex w-full items-start gap-4 px-4 py-5 text-left transition hover:bg-zinc-50 dark:hover:bg-white/[0.03] sm:px-6 sm:py-6"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? panelId : undefined}
                  >
                    <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2563EB]/20 text-sm font-bold text-[#60A5FA] ring-1 ring-[#2563EB]/40">
                      {w.week}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium uppercase tracking-wide text-[#10B981]">
                        {w.theme}
                      </span>
                      <span className="mt-1 block text-lg font-semibold text-zinc-900 sm:text-xl dark:text-white">
                        {w.topic}
                      </span>
                    </span>
                    <FaChevronDown
                      className={`mt-2 h-5 w-5 shrink-0 text-zinc-400 transition-transform duration-300 dark:text-slate-500 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={panelId}
                        key={`panel-${w.week}`}
                        role="region"
                        aria-labelledby={triggerId}
                        variants={accordionPanelVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        transition={{ duration: 0.38, ease: accordionEase }}
                        className="relative z-10 overflow-hidden border-t border-zinc-200 dark:border-white/10"
                      >
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-5 px-4 py-5 sm:px-6 sm:py-6"
                        >
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Topic
                            </h3>
                            <p className="mt-1 text-zinc-900 dark:text-white">{w.topic}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Concepts
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-slate-400">{w.concepts}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Tools Used
                            </h3>
                            <ul className="mt-2 flex flex-wrap gap-2">
                              {w.toolsUsed.map((tool) => (
                                <li
                                  key={tool}
                                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-800 ring-1 ring-zinc-200 sm:text-sm dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"
                                >
                                  {tool}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Assignment
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-slate-300">{w.assignment}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Real-World Use Case
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-slate-400">{w.useCase}</p>
                          </div>
                        </motion.div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Evaluation */}
      <section className="border-t border-zinc-200 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 dark:border-white/10" aria-labelledby="syllabus-eval">
        <div className="mx-auto max-w-7xl">
          <h2 id="syllabus-eval" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
            Evaluation Criteria
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {course.evaluationCriteria.map((row, index) => {
              const Icon = EVAL_ICONS[index] ?? FaCircleCheck;
              return (
                <article
                  key={row.component}
                  className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-md dark:border-white/10 dark:bg-[#0D1B2A]"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2563EB]/15 text-[#2563EB]">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <div>
                      <p className="text-4xl font-black tabular-nums text-zinc-900 dark:text-white">{row.weight}</p>
                      <h3 className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">{row.component}</h3>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-slate-400">{row.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capstone */}
      <section className="border-t border-zinc-200 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 dark:border-white/10" aria-labelledby="syllabus-capstone">
        <div className="mx-auto max-w-7xl">
          <h2 id="syllabus-capstone" className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
            Capstone Project
          </h2>
          <div className="mt-8 rounded-2xl border border-[#2563EB]/40 bg-gradient-to-br from-white to-zinc-100 p-6 shadow-md dark:from-[#0D1B2A] dark:to-[#0a1628] dark:shadow-[0_0_40px_-12px_rgba(37,99,235,0.35)] sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60A5FA]">Week 12</p>
            <h3 className="mt-2 text-xl font-bold text-zinc-900 sm:text-2xl dark:text-white">
              {capstoneWeek?.topic ?? "Capstone - Final Project"}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-slate-400">
              {capstoneWeek?.concepts}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-700 sm:text-base dark:text-slate-300">
              You&apos;ll scope a real problem, integrate{" "}
              <strong className="font-semibold text-zinc-900 dark:text-white">at least three tools</strong> from the program,
              ship polished artifacts, document your stack, and present your workflow - building a portfolio
              piece employers can evaluate on merit.
            </p>
            <p className="mt-4 rounded-xl bg-zinc-100 p-4 text-sm text-zinc-700 ring-1 ring-zinc-200 dark:bg-white/5 dark:text-slate-300 dark:ring-white/10">
              <span className="font-semibold text-[#F59E0B]">Deliverable:</span>{" "}
              {capstoneWeek?.assignment}
            </p>
          </div>
        </div>
      </section>

      {/* PDF download (footer) */}
      <section className="border-t border-zinc-200 bg-zinc-50/80 px-4 py-12 sm:px-6 sm:py-14 lg:px-8 dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
          <DownloadButton
            href={SITE.syllabusPdfUrl}
            filename={SITE.syllabusDownloadFilename}
            label="Download Syllabus PDF"
            variant="outline"
            size="md"
            trackingLabel="Download GenValue syllabus PDF"
          />
        </div>
      </section>

      {/* Sticky enroll */}
      <motion.div
        className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:justify-end sm:p-6"
        initial={false}
        animate={{
          opacity: showStickyEnroll ? 1 : 0,
          y: showStickyEnroll ? 0 : 24,
        }}
        transition={{ duration: 0.28, ease: accordionEase }}
        style={{ pointerEvents: showStickyEnroll ? "auto" : "none" }}
      >
        <EnrollNowLink
          aria-label="Enroll in AI Tools Mastery program"
          className="pointer-events-auto inline-flex min-h-12 items-center justify-center rounded-full bg-[#F59E0B] px-8 text-sm font-semibold text-[#0D1B2A] shadow-lg shadow-amber-500/30 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B] sm:min-h-[3rem] sm:px-10 sm:text-base"
        >
          Enroll Now
        </EnrollNowLink>
      </motion.div>
    </div>
  );
}

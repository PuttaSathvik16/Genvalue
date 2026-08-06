"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaBookOpen,
  FaClipboardList,
  FaFloppyDisk,
  FaPencil,
  FaPlus,
  FaTrash,
  FaUsers,
  FaVideo,
} from "react-icons/fa6";
import {
  createAdminCourse,
  deleteAdminCourse,
  listAdminCourses,
  updateAdminCourse,
  type AdminCourse,
  type AdminCourseWeek,
} from "@/services/adminService";
import { CardGridSkeleton, PortalTitleSkeleton } from "@/components/skeletons";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"] as const;

function statusClass(status: string): string {
  if (status === "ACTIVE") return "bg-[#10B981]/10 text-[#0d9668] dark:text-[#10B981]";
  if (status === "ARCHIVED") return "bg-[#6B6558]/10 text-[#6B6558] dark:text-slate-400";
  return "bg-[#F59E0B]/10 text-[#B45309] dark:text-[#F59E0B]";
}

function difficultyClass(level?: string): string {
  if (level === "ADVANCED") return "text-[#B45309] dark:text-[#F59E0B]";
  if (level === "INTERMEDIATE") return "text-[#2563EB] dark:text-[#60A5FA]";
  return "text-[#10B981] dark:text-[#10B981]";
}

export default function AdminCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [newCourseForm, setNewCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    level: "BEGINNER",
    duration: "12 weeks",
    status: "DRAFT",
    weekCount: 12,
  });

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listAdminCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleSaveCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingCourse) return;

    setSaving(true);
    setError("");
    try {
      const saved = await updateAdminCourse(editingCourse.id, {
        title: editingCourse.title,
        slug: editingCourse.slug,
        description: editingCourse.description,
        level: editingCourse.level,
        duration: editingCourse.duration,
        status: editingCourse.status,
      });

      setCourses((prev) => prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)));
      setSuccess("Course details updated");
      setEditingCourse(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCourse = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const created = await createAdminCourse(newCourseForm);
      setCourses((prev) => [...prev, created]);
      setSuccess(`Course "${created.title}" created with ${created.weeks.length} weeks`);
      setCreatingCourse(false);
      setNewCourseForm({
        title: "",
        slug: "",
        description: "",
        level: "BEGINNER",
        duration: "12 weeks",
        status: "DRAFT",
        weekCount: 12,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (course: AdminCourse) => {
    if (!confirm(`Delete "${course.title}" and all its weeks? This cannot be undone.`)) return;

    setError("");
    try {
      await deleteAdminCourse(course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      setSuccess(`Deleted ${course.title}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PortalTitleSkeleton hasAction />
        <CardGridSkeleton count={3} cols={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ LMS CONTENT
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#0D1B2A] dark:text-white sm:text-3xl">
            Manage Courses
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Each week card opens the full module editor. Published content projects to the student LMS.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreatingCourse(true);
            setError("");
            setSuccess("");
          }}
          aria-label="Create new course"
          className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-[#1d4ed8] dark:bg-[#60A5FA] dark:text-[#070B19]"
        >
          <FaPlus className="h-3.5 w-3.5" /> New Course
        </button>
      </div>

      {error && !editingCourse && !creatingCourse && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/10 p-4 text-sm font-semibold text-[#0d9668] dark:text-[#10B981]">
          {success}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <FaBookOpen className="h-14 w-14 text-[#2563EB]/30 dark:text-[#60A5FA]/30" />
          <p className="text-sm text-[#6B6558] dark:text-slate-400">No courses yet. Create your first course.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {courses.map((course) => (
            <section key={course.id} className="space-y-4">
              <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display-custom text-xl font-extrabold text-[#0D1B2A] dark:text-white sm:text-2xl">
                        {course.title}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${statusClass(course.status)}`}
                      >
                        {course.status}
                      </span>
                      <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10px] font-extrabold dark:bg-white/10">
                        {course.level}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-300">{course.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
                      <span>{course.duration}</span>
                      <span>{course.weeks.length} modules</span>
                      <span className="inline-flex items-center gap-1">
                        <FaUsers className="h-3 w-3" /> {course.enrollmentCount} enrolled
                      </span>
                      <span className="font-mono lowercase">/{course.slug}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourse(course);
                        setError("");
                        setSuccess("");
                      }}
                      aria-label={`Edit course ${course.title}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] hover:bg-black/5 dark:border-white/10 dark:text-[#60A5FA] dark:hover:bg-white/5"
                    >
                      <FaPencil className="h-3 w-3" /> Edit Course
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(course)}
                      aria-label={`Delete course ${course.title}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400"
                    >
                      <FaTrash className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {course.weeks.map((week) => (
                  <WeekModuleCard key={`${course.id}-${week.week}`} courseId={course.id} week={week} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Course edit modal */}
      {editingCourse && (
        <CourseModal
          title="Edit Course"
          onClose={() => !saving && setEditingCourse(null)}
          onSubmit={handleSaveCourse}
          saving={saving}
        >
          <CourseFormFields
            values={editingCourse}
            onChange={(patch) => setEditingCourse({ ...editingCourse, ...patch })}
          />
        </CourseModal>
      )}

      {creatingCourse && (
        <CourseModal
          title="New Course"
          onClose={() => !saving && setCreatingCourse(false)}
          onSubmit={handleCreateCourse}
          saving={saving}
          submitLabel="Create"
          submitIcon={FaPlus}
        >
          <CourseFormFields
            values={newCourseForm}
            onChange={(patch) => setNewCourseForm({ ...newCourseForm, ...patch })}
            isNew
          />
        </CourseModal>
      )}
    </div>
  );
}

function WeekModuleCard({ courseId, week }: { courseId: string; week: AdminCourseWeek }) {
  const editorHref = `/admin/courses/${courseId}/weeks/${week.week}`;

  return (
    <motion.div
      layout
      className="group flex flex-col rounded-2xl border border-black/10 bg-white/60 p-4 shadow-md transition hover:border-[#2563EB]/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-[#60A5FA]/30"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB] text-[10px] font-bold text-white dark:bg-[#60A5FA] dark:text-[#070B19]">
            W{week.week}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${statusClass(week.status)}`}>
            {week.status}
          </span>
          {!week.isReleased && (
            <span className="rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[9px] font-bold uppercase text-[#B45309]">
              Hidden
            </span>
          )}
        </div>
        <Link
          href={editorHref}
          aria-label={`Edit module week ${week.week}`}
          className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <FaPencil className="h-3.5 w-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
        </Link>
      </div>

      <h3 className="line-clamp-2 text-sm font-bold text-[#0D1B2A] dark:text-white">{week.title}</h3>
      <p className="mt-1 line-clamp-2 text-[11px] text-[#6B6558] dark:text-slate-400">
        {week.description || "No description yet"}
      </p>

      {week.difficultyLevel && (
        <p className={`mt-2 text-[10px] font-extrabold uppercase ${difficultyClass(week.difficultyLevel)}`}>
          {week.difficultyLevel}
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-bold text-[#6B6558] dark:text-slate-400">
        <span>{week.lessonCount ?? 0} lessons</span>
        <span>{week.topicsCount ?? 0} topics</span>
        <span className="inline-flex items-center gap-1">
          <FaVideo className="h-2.5 w-2.5" /> {week.videoCount ?? 0} videos
        </span>
        <span>{week.resourceCount ?? 0} resources</span>
        {week.estimatedMinutes != null && <span>{week.estimatedMinutes} min</span>}
        {week.hasQuiz && <span>Quiz attached</span>}
        {week.hasAssignment && (
          <span className="inline-flex items-center gap-1">
            <FaClipboardList className="h-2.5 w-2.5" /> Assignment
          </span>
        )}
      </div>

      {week.learningOutcomes && week.learningOutcomes.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-black/10 pt-3 dark:border-white/10">
          {week.learningOutcomes.slice(0, 3).map((outcome, idx) => (
            <li key={idx} className="line-clamp-1 text-[10px] text-[#6B6558] dark:text-slate-500">
              ✓ {outcome}
            </li>
          ))}
        </ul>
      )}

      <Link
        href={editorHref}
        aria-label={`Open full editor for week ${week.week}`}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#2563EB]/30 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] transition group-hover:bg-[#2563EB] group-hover:text-white dark:border-[#60A5FA]/30 dark:text-[#60A5FA] dark:group-hover:bg-[#60A5FA] dark:group-hover:text-[#070B19]"
      >
        <FaPencil className="h-3 w-3" /> Edit Module
      </Link>
    </motion.div>
  );
}

function CourseModal({
  title,
  children,
  onClose,
  onSubmit,
  saving,
  submitLabel = "Save",
  submitIcon: SubmitIcon = FaFloppyDisk,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
  submitLabel?: string;
  submitIcon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-lg rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
      >
        <h2 id="course-modal-title" className="font-display-custom text-xl font-extrabold text-[#0D1B2A] dark:text-white">
          {title}
        </h2>
        <div className="mt-4 space-y-3">{children}</div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} disabled={saving} className={`flex-1 ${secondaryBtnClass}`}>
            Cancel
          </button>
          <button type="submit" disabled={saving} className={`flex-1 ${primaryBtnClass}`}>
            <SubmitIcon className="h-4 w-4" />
            {saving ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function CourseFormFields({
  values,
  onChange,
  isNew,
}: {
  values: {
    title: string;
    slug: string;
    description: string;
    level: string;
    duration: string;
    status: string;
    weekCount?: number;
  };
  onChange: (patch: Partial<typeof values>) => void;
  isNew?: boolean;
}) {
  return (
    <>
      <div>
        <label htmlFor="course-title" className={labelClass}>Title</label>
        <input
          id="course-title"
          required
          value={values.title}
          onChange={(e) =>
            onChange(
              isNew
                ? {
                    title: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                  }
                : { title: e.target.value }
            )
          }
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="course-slug" className={labelClass}>URL slug</label>
        <input
          id="course-slug"
          required
          value={values.slug}
          onChange={(e) => onChange({ slug: e.target.value })}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="course-description" className={labelClass}>Description</label>
        <textarea
          id="course-description"
          rows={3}
          value={values.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {isNew && (
          <div>
            <label htmlFor="new-weeks" className={labelClass}>Weeks</label>
            <input
              id="new-weeks"
              type="number"
              min={1}
              max={24}
              value={values.weekCount ?? 12}
              onChange={(e) => onChange({ weekCount: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
        )}
        <div>
          <label htmlFor="course-level" className={labelClass}>Level</label>
          <select
            id="course-level"
            value={values.level}
            onChange={(e) => onChange({ level: e.target.value })}
            className={inputClass}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        {!isNew && (
          <div>
            <label htmlFor="course-status" className={labelClass}>Status</label>
            <select
              id="course-status"
              value={values.status}
              onChange={(e) => onChange({ status: e.target.value })}
              className={inputClass}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="course-duration" className={labelClass}>Duration label</label>
        <input
          id="course-duration"
          value={values.duration}
          onChange={(e) => onChange({ duration: e.target.value })}
          className={inputClass}
        />
      </div>
    </>
  );
}

const labelClass =
  "mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#6B6558] dark:text-slate-400";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

const primaryBtnClass =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1d4ed8] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]";

const secondaryBtnClass =
  "rounded-full border border-black/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6B6558] hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5";

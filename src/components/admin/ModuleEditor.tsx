"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowUp,
  FaBookOpen,
  FaCircleCheck,
  FaClipboardList,
  FaClone,
  FaEye,
  FaFile,
  FaFloppyDisk,
  FaLink,
  FaPlus,
  FaTrash,
  FaVideo,
} from "react-icons/fa6";
import {
  getAdminModuleDetail,
  updateAdminModuleDetail,
} from "@/services/adminService";
import {
  newId,
  type AdminModuleDetail,
  type CodeExample,
  type ExternalLink,
  type ModuleEditorTab,
  type ModuleLesson,
  type ModuleResource,
  type ModuleVideo,
} from "@/types/moduleEditor";
import { PortalTitleSkeleton, SettingsPageSkeleton } from "@/components/skeletons";

const TABS: { id: ModuleEditorTab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "lessons", label: "Lessons" },
  { id: "resources", label: "Resources" },
  { id: "videos", label: "Videos" },
  { id: "notes", label: "Notes" },
  { id: "assignments", label: "Assignments" },
  { id: "quiz", label: "Quiz" },
  { id: "settings", label: "Settings" },
  { id: "preview", label: "Preview" },
];

const DIFFICULTY = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const MODULE_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
const LESSON_TYPES = ["VIDEO", "READING", "LIVE", "LAB"] as const;
const LESSON_STATUSES = ["DRAFT", "ACTIVE"] as const;
const RESOURCE_TYPES = ["PDF", "PPT", "DOCX", "XLSX", "TXT", "ZIP", "CSV", "NOTEBOOK", "MD"] as const;
const CODE_LANGS = ["PYTHON", "JAVASCRIPT", "TYPESCRIPT", "SQL", "BASH"] as const;

interface ModuleEditorProps {
  courseId: string;
  weekNumber: number;
  courseTitle?: string;
}

export function ModuleEditor({ courseId, weekNumber, courseTitle }: ModuleEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<ModuleEditorTab>("general");
  const [module, setModule] = useState<AdminModuleDetail | null>(null);

  const loadModule = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminModuleDetail(courseId, weekNumber);
      setModule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load module");
      setModule(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, weekNumber]);

  useEffect(() => {
    loadModule();
  }, [loadModule]);

  const updateModule = (patch: Partial<AdminModuleDetail>) => {
    setModule((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const updateContent = (patch: Partial<AdminModuleDetail["content"]>) => {
    setModule((prev) =>
      prev ? { ...prev, content: { ...prev.content, ...patch } } : prev
    );
  };

  const handleSave = async (publish = false) => {
    if (!module) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload: Partial<AdminModuleDetail> = {
        title: module.title,
        description: module.description,
        objectives: module.objectives,
        estimatedMinutes: module.estimatedMinutes,
        status: publish ? "ACTIVE" : module.status,
        isReleased: publish ? true : module.isReleased,
        lessons: module.lessons,
        content: {
          ...module.content,
          learningObjectives: module.objectives,
          estimatedMinutes: module.estimatedMinutes,
          releaseSettings: publish
            ? { ...module.content.releaseSettings, publishImmediately: true }
            : module.content.releaseSettings,
        },
      };
      const saved = await updateAdminModuleDetail(courseId, weekNumber, payload);
      setModule(saved);
      setSuccess(publish ? "Module published to LMS" : "Draft saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save module");
    } finally {
      setSaving(false);
    }
  };

  const lmsProjection = useMemo(() => {
    if (!module) return null;
    return {
      week: module.week,
      title: module.title,
      description: module.description,
      objectives: module.objectives,
      outcomes: module.content.learningOutcomes,
      lessons: module.lessons.filter((l) => l.status === "ACTIVE"),
      resources: [...module.content.resources, ...module.content.downloads],
      videos: module.content.videos,
      notes: module.content.instructorNotes,
      quiz: module.content.quiz,
      assignment: module.content.assignment,
      links: module.content.externalLinks,
      visible: module.isReleased && module.status === "ACTIVE",
    };
  }, [module]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading module editor">
        <PortalTitleSkeleton hasAction />
        <SettingsPageSkeleton />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error || "Module not found"}</p>
        <Link
          href="/admin/courses"
          className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#2563EB] dark:text-[#60A5FA]"
          aria-label="Back to courses"
        >
          <FaArrowLeft className="h-3 w-3" /> Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/admin/courses"
            className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B6558] hover:text-[#2563EB] dark:text-slate-400 dark:hover:text-[#60A5FA]"
            aria-label="Back to manage courses"
          >
            <FaArrowLeft className="h-3 w-3" /> Manage Courses
          </Link>
          {courseTitle && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-500">
              {courseTitle}
            </p>
          )}
          <span className="font-annotation text-[10px] font-bold uppercase tracking-widest text-[#2563EB] dark:text-[#60A5FA]">
            Week {module.week}
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold text-[#0D1B2A] dark:text-white sm:text-3xl">
            Edit Module
          </h1>
          <p className="text-xs text-[#6B6558] dark:text-slate-400">
            Content saved here is projected to the student LMS when published.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            aria-label="Preview module"
            className={secondaryBtn}
          >
            <FaEye className="h-3.5 w-3.5" /> Preview
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            aria-label="Save draft"
            className={secondaryBtn}
          >
            <FaFloppyDisk className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            aria-label="Publish module to LMS"
            className={primaryBtn}
          >
            <FaCircleCheck className="h-3.5 w-3.5" /> Publish
          </button>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`rounded-xl border p-4 text-sm font-semibold ${
            error
              ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
              : "border-[#10B981]/20 bg-[#10B981]/10 text-[#0d9668] dark:text-[#10B981]"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/5">
        <div className="flex min-w-max gap-1 p-2" role="tablist" aria-label="Module editor sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={`${tab.label} tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider transition ${
                activeTab === tab.id
                  ? "bg-[#2563EB] text-white dark:bg-[#60A5FA] dark:text-[#070B19]"
                  : "text-[#6B6558] hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8"
      >
        {activeTab === "general" && (
          <GeneralTab module={module} updateModule={updateModule} updateContent={updateContent} />
        )}
        {activeTab === "lessons" && (
          <LessonsTab
            lessons={module.lessons}
            onChange={(lessons) => updateModule({ lessons })}
          />
        )}
        {activeTab === "resources" && (
          <ResourcesTab content={module.content} updateContent={updateContent} />
        )}
        {activeTab === "videos" && (
          <VideosTab videos={module.content.videos} updateContent={updateContent} />
        )}
        {activeTab === "notes" && (
          <NotesTab notes={module.content.instructorNotes} updateContent={updateContent} />
        )}
        {activeTab === "assignments" && (
          <AssignmentsTab assignment={module.content.assignment} updateContent={updateContent} />
        )}
        {activeTab === "quiz" && (
          <QuizTab quiz={module.content.quiz} updateContent={updateContent} />
        )}
        {activeTab === "settings" && (
          <SettingsTab module={module} updateModule={updateModule} updateContent={updateContent} />
        )}
        {activeTab === "preview" && lmsProjection && <PreviewTab projection={lmsProjection} />}
      </motion.div>

      {module.status === "ACTIVE" && (
        <AnalyticsPanel analytics={module.analytics} />
      )}
    </div>
  );
}

function GeneralTab({
  module,
  updateModule,
  updateContent,
}: {
  module: AdminModuleDetail;
  updateModule: (p: Partial<AdminModuleDetail>) => void;
  updateContent: (p: Partial<AdminModuleDetail["content"]>) => void;
}) {
  const [newOutcome, setNewOutcome] = useState("");

  const addOutcome = () => {
    const trimmed = newOutcome.trim();
    if (!trimmed) return;
    updateContent({ learningOutcomes: [...module.content.learningOutcomes, trimmed] });
    setNewOutcome("");
  };

  const moveOutcome = (index: number, dir: -1 | 1) => {
    const next = [...module.content.learningOutcomes];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateContent({ learningOutcomes: next });
  };

  return (
    <div className="space-y-6">
      <SectionTitle title="Module Information" subtitle="Core details projected to LMS week cards" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Module number">
          <input value={`Week ${module.week}`} disabled className={inputClass} aria-label="Module number" />
        </Field>
        <Field label="Difficulty">
          <select
            value={module.content.difficultyLevel}
            onChange={(e) => updateContent({ difficultyLevel: e.target.value as typeof DIFFICULTY[number] })}
            className={inputClass}
            aria-label="Difficulty level"
          >
            {DIFFICULTY.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>
        <Field label="Module title" className="sm:col-span-2">
          <input
            required
            value={module.title}
            onChange={(e) => updateModule({ title: e.target.value })}
            className={inputClass}
            aria-label="Module title"
          />
        </Field>
        <Field label="Description" className="sm:col-span-2">
          <textarea
            rows={3}
            required
            value={module.description}
            onChange={(e) => updateModule({ description: e.target.value })}
            className={inputClass}
            aria-label="Module description"
          />
        </Field>
        <Field label="Learning objectives" className="sm:col-span-2">
          <textarea
            rows={3}
            required
            value={module.objectives}
            onChange={(e) => updateModule({ objectives: e.target.value })}
            placeholder="What students will learn this week…"
            className={inputClass}
            aria-label="Learning objectives"
          />
        </Field>
        <Field label="Estimated duration (minutes)">
          <input
            type="number"
            min={0}
            value={module.estimatedMinutes ?? ""}
            onChange={(e) =>
              updateModule({
                estimatedMinutes: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={inputClass}
            aria-label="Estimated duration in minutes"
          />
        </Field>
        <Field label="Module status">
          <select
            value={module.status}
            onChange={(e) => updateModule({ status: e.target.value as typeof MODULE_STATUSES[number] })}
            className={inputClass}
            aria-label="Module status"
          >
            {MODULE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2 flex items-center gap-3">
          <input
            id="release-toggle"
            type="checkbox"
            checked={module.isReleased}
            onChange={(e) => updateModule({ isReleased: e.target.checked })}
            className="h-4 w-4"
            aria-label="Release to students"
          />
          <label htmlFor="release-toggle" className="text-xs font-bold text-[#0D1B2A] dark:text-white">
            Release to students (visible in LMS)
          </label>
        </div>
      </div>

      <SectionTitle title="Learning Outcomes" subtitle="Shown as topic bullets on LMS week cards" />
      <div className="space-y-2">
        {module.content.learningOutcomes.map((outcome, idx) => (
          <div
            key={`${outcome}-${idx}`}
            className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5"
          >
            <FaCircleCheck className="h-3 w-3 shrink-0 text-[#10B981]" />
            <span className="flex-1 text-xs text-[#0D1B2A] dark:text-white">{outcome}</span>
            <IconBtn label="Move outcome up" onClick={() => moveOutcome(idx, -1)} disabled={idx === 0}>
              <FaArrowUp className="h-3 w-3" />
            </IconBtn>
            <IconBtn
              label="Move outcome down"
              onClick={() => moveOutcome(idx, 1)}
              disabled={idx === module.content.learningOutcomes.length - 1}
            >
              <FaArrowDown className="h-3 w-3" />
            </IconBtn>
            <IconBtn
              label="Remove outcome"
              onClick={() =>
                updateContent({
                  learningOutcomes: module.content.learningOutcomes.filter((_, i) => i !== idx),
                })
              }
              danger
            >
              <FaTrash className="h-3 w-3" />
            </IconBtn>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newOutcome}
          onChange={(e) => setNewOutcome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOutcome())}
          placeholder="Add learning outcome…"
          className={inputClass}
          aria-label="New learning outcome"
        />
        <button type="button" onClick={addOutcome} aria-label="Add outcome" className={primaryBtn}>
          <FaPlus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LessonsTab({
  lessons,
  onChange,
}: {
  lessons: ModuleLesson[];
  onChange: (lessons: ModuleLesson[]) => void;
}) {
  const addLesson = () => {
    onChange([
      ...lessons,
      {
        id: newId("new-lesson"),
        title: "",
        description: "",
        type: "VIDEO",
        duration: null,
        status: "DRAFT",
        order: lessons.length + 1,
        videoUrl: null,
        topics: [],
      },
    ]);
  };

  const duplicateLesson = (index: number) => {
    const source = lessons[index];
    onChange([
      ...lessons,
      {
        ...source,
        id: newId("new-lesson"),
        title: `${source.title} (Copy)`,
        order: lessons.length + 1,
      },
    ]);
  };

  const updateLesson = (index: number, patch: Partial<ModuleLesson>) => {
    onChange(lessons.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  };

  const moveLesson = (index: number, dir: -1 | 1) => {
    const next = [...lessons];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((l, i) => ({ ...l, order: i + 1 })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle title="Lessons" subtitle="Each lesson can have its own topics and type" />
        <button type="button" onClick={addLesson} aria-label="Add lesson" className={primaryBtn}>
          <FaPlus className="h-3.5 w-3.5" /> Add Lesson
        </button>
      </div>

      {lessons.length === 0 ? (
        <EmptyState icon={FaBookOpen} message="No lessons yet. Add your first lesson." />
      ) : (
        <div className="space-y-4">
          {lessons.map((lesson, idx) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={idx}
              total={lessons.length}
              onUpdate={(patch) => updateLesson(idx, patch)}
              onDelete={() => onChange(lessons.filter((_, i) => i !== idx))}
              onDuplicate={() => duplicateLesson(idx)}
              onMove={(dir) => moveLesson(idx, dir)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonCard({
  lesson,
  index,
  total,
  onUpdate,
  onDelete,
  onDuplicate,
  onMove,
}: {
  lesson: ModuleLesson;
  index: number;
  total: number;
  onUpdate: (patch: Partial<ModuleLesson>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const [newTopic, setNewTopic] = useState("");

  const addTopic = () => {
    const trimmed = newTopic.trim();
    if (!trimmed) return;
    onUpdate({ topics: [...lesson.topics, trimmed] });
    setNewTopic("");
  };

  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
          Lesson {index + 1}
        </span>
        <div className="flex gap-1">
          <IconBtn label="Move lesson up" onClick={() => onMove(-1)} disabled={index === 0}>
            <FaArrowUp className="h-3 w-3" />
          </IconBtn>
          <IconBtn label="Move lesson down" onClick={() => onMove(1)} disabled={index === total - 1}>
            <FaArrowDown className="h-3 w-3" />
          </IconBtn>
          <IconBtn label="Duplicate lesson" onClick={onDuplicate}>
            <FaClone className="h-3 w-3" />
          </IconBtn>
          <IconBtn label="Delete lesson" onClick={onDelete} danger>
            <FaTrash className="h-3 w-3" />
          </IconBtn>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Lesson title" className="sm:col-span-2">
          <input
            value={lesson.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className={inputClass}
            aria-label={`Lesson ${index + 1} title`}
          />
        </Field>
        <Field label="Type">
          <select
            value={lesson.type}
            onChange={(e) => onUpdate({ type: e.target.value as typeof LESSON_TYPES[number] })}
            className={inputClass}
            aria-label={`Lesson ${index + 1} type`}
          >
            {LESSON_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Duration (mins)">
          <input
            type="number"
            min={0}
            value={lesson.duration ?? ""}
            onChange={(e) =>
              onUpdate({ duration: e.target.value ? Number(e.target.value) : null })
            }
            className={inputClass}
            aria-label={`Lesson ${index + 1} duration`}
          />
        </Field>
        <Field label="Visibility">
          <select
            value={lesson.status}
            onChange={(e) => onUpdate({ status: e.target.value as typeof LESSON_STATUSES[number] })}
            className={inputClass}
            aria-label={`Lesson ${index + 1} visibility`}
          >
            {LESSON_STATUSES.map((s) => (
              <option key={s} value={s}>{s === "ACTIVE" ? "Published" : "Draft"}</option>
            ))}
          </select>
        </Field>
        <Field label="Video URL (optional)">
          <input
            type="url"
            value={lesson.videoUrl ?? ""}
            onChange={(e) => onUpdate({ videoUrl: e.target.value || null })}
            className={inputClass}
            aria-label={`Lesson ${index + 1} video URL`}
          />
        </Field>
      </div>

      <div className="mt-4">
        <p className={labelClass}>Topics under this lesson</p>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {lesson.topics.map((topic, tIdx) => (
            <span
              key={`${topic}-${tIdx}`}
              className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-bold dark:bg-white/10"
            >
              {topic}
              <button
                type="button"
                onClick={() => onUpdate({ topics: lesson.topics.filter((_, i) => i !== tIdx) })}
                aria-label={`Remove topic ${topic}`}
                className="text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
            placeholder="Add topic…"
            className={inputClass}
            aria-label={`Add topic for lesson ${index + 1}`}
          />
          <button type="button" onClick={addTopic} aria-label="Add topic" className={primaryBtn}>
            <FaPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ResourcesTab({
  content,
  updateContent,
}: {
  content: AdminModuleDetail["content"];
  updateContent: (p: Partial<AdminModuleDetail["content"]>) => void;
}) {
  const addResource = (list: "resources" | "downloads") => {
    const item: ModuleResource = {
      id: newId("res"),
      name: "",
      type: "PDF",
      fileUrl: "",
      externalUrl: "",
      downloadable: true,
    };
    updateContent({ [list]: [...content[list], item] });
  };

  const updateResource = (
    list: "resources" | "downloads",
    id: string,
    patch: Partial<ModuleResource>
  ) => {
    updateContent({
      [list]: content[list].map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };

  const removeResource = (list: "resources" | "downloads", id: string) => {
    updateContent({ [list]: content[list].filter((r) => r.id !== id) });
  };

  const renderList = (list: "resources" | "downloads", title: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0D1B2A] dark:text-white">{title}</h3>
        <button
          type="button"
          onClick={() => addResource(list)}
          aria-label={`Upload ${title.toLowerCase()}`}
          className={secondaryBtn}
        >
          <FaPlus className="h-3 w-3" /> Upload
        </button>
      </div>
      {content[list].length === 0 ? (
        <p className="text-xs text-[#6B6558] dark:text-slate-400">No files yet - paste a hosted URL.</p>
      ) : (
        content[list].map((resource) => (
          <ResourceRow
            key={resource.id}
            resource={resource}
            onChange={(patch) => updateResource(list, resource.id, patch)}
            onDelete={() => removeResource(list, resource.id)}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <SectionTitle
        title="Learning Resources"
        subtitle="PDFs, slides, notebooks - URLs are projected to LMS resource lists"
      />
      {renderList("resources", "Module Resources")}
      {renderList("downloads", "Post-Module Downloads")}
      <ExternalLinksSection
        links={content.externalLinks}
        onChange={(externalLinks) => updateContent({ externalLinks })}
      />
      <CodeExamplesSection
        examples={content.codeExamples}
        onChange={(codeExamples) => updateContent({ codeExamples })}
      />
      <ImagesSection images={content.images} onChange={(images) => updateContent({ images })} />
    </div>
  );
}

function ResourceRow({
  resource,
  onChange,
  onDelete,
}: {
  resource: ModuleResource;
  onChange: (patch: Partial<ModuleResource>) => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid gap-2 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-6">
      <input
        value={resource.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="Resource name"
        className={`${inputClass} sm:col-span-2`}
        aria-label="Resource name"
      />
      <select
        value={resource.type}
        onChange={(e) => onChange({ type: e.target.value as ModuleResource["type"] })}
        className={inputClass}
        aria-label="Resource type"
      >
        {RESOURCE_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <input
        type="url"
        value={resource.externalUrl || resource.fileUrl}
        onChange={(e) => onChange({ externalUrl: e.target.value, fileUrl: e.target.value })}
        placeholder="Hosted file URL"
        className={`${inputClass} sm:col-span-2`}
        aria-label="Resource URL"
      />
      <div className="flex items-center gap-2">
        <input
          id={`dl-${resource.id}`}
          type="checkbox"
          checked={resource.downloadable}
          onChange={(e) => onChange({ downloadable: e.target.checked })}
          aria-label="Downloadable resource"
        />
        <label htmlFor={`dl-${resource.id}`} className="text-[10px] font-bold">Download</label>
        <IconBtn label="Delete resource" onClick={onDelete} danger>
          <FaTrash className="h-3 w-3" />
        </IconBtn>
      </div>
    </div>
  );
}

function VideosTab({
  videos,
  updateContent,
}: {
  videos: ModuleVideo[];
  updateContent: (p: Partial<AdminModuleDetail["content"]>) => void;
}) {
  const addVideo = () => {
    updateContent({
      videos: [
        ...videos,
        {
          id: newId("vid"),
          title: "",
          fileUrl: "",
          externalUrl: "",
          thumbnailUrl: "",
          durationMinutes: null,
          captionsUrl: "",
          previewEnabled: false,
        },
      ],
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle title="Videos" subtitle="YouTube, Vimeo, Cloudinary, or MP4 URLs" />
        <button type="button" onClick={addVideo} aria-label="Add video" className={primaryBtn}>
          <FaPlus className="h-3.5 w-3.5" /> Add Video
        </button>
      </div>
      {videos.length === 0 ? (
        <EmptyState icon={FaVideo} message="No videos added. Link hosted videos for LMS playback." />
      ) : (
        videos.map((video, idx) => (
          <div
            key={video.id}
            className="grid gap-2 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/5 sm:grid-cols-2"
          >
            <input
              value={video.title}
              onChange={(e) =>
                updateContent({
                  videos: videos.map((v) =>
                    v.id === video.id ? { ...v, title: e.target.value } : v
                  ),
                })
              }
              placeholder="Video title"
              className={inputClass}
              aria-label={`Video ${idx + 1} title`}
            />
            <input
              type="url"
              value={video.externalUrl || video.fileUrl}
              onChange={(e) =>
                updateContent({
                  videos: videos.map((v) =>
                    v.id === video.id
                      ? { ...v, externalUrl: e.target.value, fileUrl: e.target.value }
                      : v
                  ),
                })
              }
              placeholder="Video URL"
              className={inputClass}
              aria-label={`Video ${idx + 1} URL`}
            />
            <input
              type="url"
              value={video.thumbnailUrl}
              onChange={(e) =>
                updateContent({
                  videos: videos.map((v) =>
                    v.id === video.id ? { ...v, thumbnailUrl: e.target.value } : v
                  ),
                })
              }
              placeholder="Thumbnail URL"
              className={inputClass}
              aria-label={`Video ${idx + 1} thumbnail`}
            />
            <div className="flex items-center gap-3">
              <input
                id={`preview-${video.id}`}
                type="checkbox"
                checked={video.previewEnabled}
                onChange={(e) =>
                  updateContent({
                    videos: videos.map((v) =>
                      v.id === video.id ? { ...v, previewEnabled: e.target.checked } : v
                    ),
                  })
                }
                aria-label={`Enable preview for video ${idx + 1}`}
              />
              <label htmlFor={`preview-${video.id}`} className="text-xs font-bold">
                Preview enabled
              </label>
              <IconBtn
                label={`Delete video ${idx + 1}`}
                onClick={() =>
                  updateContent({ videos: videos.filter((v) => v.id !== video.id) })
                }
                danger
              >
                <FaTrash className="h-3 w-3" />
              </IconBtn>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function NotesTab({
  notes,
  updateContent,
}: {
  notes: string;
  updateContent: (p: Partial<AdminModuleDetail["content"]>) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionTitle title="Instructor Notes" subtitle="Rich text content shown in the LMS lesson view" />
      <textarea
        rows={14}
        value={notes}
        onChange={(e) => updateContent({ instructorNotes: e.target.value })}
        placeholder="Headings, bullet lists, code blocks, links…"
        className={inputClass}
        aria-label="Instructor notes"
      />
      <p className="flex items-center gap-1.5 text-[10px] text-[#6B6558] dark:text-slate-500">
        <FaFile className="h-3 w-3" /> Supports markdown-style formatting. Shown to students when published.
      </p>
    </div>
  );
}

function AssignmentsTab({
  assignment,
  updateContent,
}: {
  assignment: AdminModuleDetail["content"]["assignment"];
  updateContent: (p: Partial<AdminModuleDetail["content"]>) => void;
}) {
  const current = assignment ?? {
    title: "",
    description: "",
    deadline: null,
    maximumMarks: 100,
    submissionType: "FILE" as const,
  };

  const setAssignment = (patch: Partial<typeof current>) => {
    updateContent({ assignment: { ...current, ...patch } });
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="Assignment" subtitle="Attached to this module in the LMS" />
      {!assignment ? (
        <button
          type="button"
          onClick={() => updateContent({ assignment: current })}
          aria-label="Create assignment"
          className={primaryBtn}
        >
          <FaClipboardList className="h-3.5 w-3.5" /> Create Assignment
        </button>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" className="sm:col-span-2">
            <input
              value={current.title}
              onChange={(e) => setAssignment({ title: e.target.value })}
              className={inputClass}
              aria-label="Assignment title"
            />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea
              rows={4}
              value={current.description}
              onChange={(e) => setAssignment({ description: e.target.value })}
              className={inputClass}
              aria-label="Assignment description"
            />
          </Field>
          <Field label="Deadline">
            <input
              type="datetime-local"
              value={current.deadline ?? ""}
              onChange={(e) => setAssignment({ deadline: e.target.value || null })}
              className={inputClass}
              aria-label="Assignment deadline"
            />
          </Field>
          <Field label="Maximum marks">
            <input
              type="number"
              min={0}
              value={current.maximumMarks}
              onChange={(e) => setAssignment({ maximumMarks: Number(e.target.value) })}
              className={inputClass}
              aria-label="Maximum marks"
            />
          </Field>
          <Field label="Submission type">
            <select
              value={current.submissionType}
              onChange={(e) =>
                setAssignment({
                  submissionType: e.target.value as "FILE" | "TEXT" | "URL",
                })
              }
              className={inputClass}
              aria-label="Submission type"
            >
              <option value="FILE">File upload</option>
              <option value="TEXT">Text</option>
              <option value="URL">URL</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => updateContent({ assignment: null })}
              aria-label="Remove assignment"
              className={secondaryBtn}
            >
              <FaTrash className="h-3.5 w-3.5" /> Remove Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuizTab({
  quiz,
  updateContent,
}: {
  quiz: AdminModuleDetail["content"]["quiz"];
  updateContent: (p: Partial<AdminModuleDetail["content"]>) => void;
}) {
  const current = quiz ?? {
    name: "",
    passingPercentage: 70,
    timeLimitMinutes: null,
    attemptsAllowed: 3,
  };

  const setQuiz = (patch: Partial<typeof current>) => {
    updateContent({ quiz: { ...current, ...patch } });
  };

  return (
    <div className="space-y-4">
      <SectionTitle title="Quick Quiz" subtitle="Quiz settings projected to LMS assessments" />
      {!quiz ? (
        <button
          type="button"
          onClick={() => updateContent({ quiz: current })}
          aria-label="Create quiz"
          className={primaryBtn}
        >
          <FaPlus className="h-3.5 w-3.5" /> Create Quiz
        </button>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quiz name" className="sm:col-span-2">
            <input
              value={current.name}
              onChange={(e) => setQuiz({ name: e.target.value })}
              className={inputClass}
              aria-label="Quiz name"
            />
          </Field>
          <Field label="Passing %">
            <input
              type="number"
              min={0}
              max={100}
              value={current.passingPercentage}
              onChange={(e) => setQuiz({ passingPercentage: Number(e.target.value) })}
              className={inputClass}
              aria-label="Passing percentage"
            />
          </Field>
          <Field label="Time limit (mins)">
            <input
              type="number"
              min={0}
              value={current.timeLimitMinutes ?? ""}
              onChange={(e) =>
                setQuiz({ timeLimitMinutes: e.target.value ? Number(e.target.value) : null })
              }
              className={inputClass}
              aria-label="Time limit in minutes"
            />
          </Field>
          <Field label="Attempts allowed">
            <input
              type="number"
              min={1}
              value={current.attemptsAllowed}
              onChange={(e) => setQuiz({ attemptsAllowed: Number(e.target.value) })}
              className={inputClass}
              aria-label="Attempts allowed"
            />
          </Field>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => updateContent({ quiz: null })}
              aria-label="Remove quiz"
              className={secondaryBtn}
            >
              <FaTrash className="h-3.5 w-3.5" /> Remove Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab({
  module,
  updateModule,
  updateContent,
}: {
  module: AdminModuleDetail;
  updateModule: (p: Partial<AdminModuleDetail>) => void;
  updateContent: (p: Partial<AdminModuleDetail["content"]>) => void;
}) {
  const rules = module.content.completionRules;
  const release = module.content.releaseSettings;

  const toggleRule = (key: keyof typeof rules) => {
    updateContent({ completionRules: { ...rules, [key]: !rules[key] } });
  };

  return (
    <div className="space-y-8">
      <SectionTitle title="Completion Rules" subtitle="Students complete the module when checked items are done" />
      <div className="space-y-2">
        {(
          [
            ["watchAllVideos", "Watch all videos"],
            ["readNotes", "Read notes"],
            ["downloadResources", "Download resources"],
            ["completeAssignment", "Complete assignment"],
            ["passQuiz", "Pass quiz"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 text-xs font-bold text-[#0D1B2A] dark:text-white">
            <input
              type="checkbox"
              checked={rules[key]}
              onChange={() => toggleRule(key)}
              aria-label={label}
            />
            {label}
          </label>
        ))}
      </div>

      <SectionTitle title="Release Settings" subtitle="Controls LMS visibility and unlock behavior" />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 text-xs font-bold">
          <input
            type="checkbox"
            checked={release.publishImmediately}
            onChange={(e) =>
              updateContent({
                releaseSettings: { ...release, publishImmediately: e.target.checked },
              })
            }
            aria-label="Publish immediately"
          />
          Publish immediately
        </label>
        <label className="flex items-center gap-3 text-xs font-bold">
          <input
            type="checkbox"
            checked={release.dripContent}
            onChange={(e) =>
              updateContent({
                releaseSettings: { ...release, dripContent: e.target.checked },
              })
            }
            aria-label="Drip content unlock"
          />
          Drip - unlock after previous module
        </label>
        <Field label="Schedule release">
          <input
            type="datetime-local"
            value={release.scheduledAt ?? ""}
            onChange={(e) =>
              updateContent({
                releaseSettings: { ...release, scheduledAt: e.target.value || null },
              })
            }
            className={inputClass}
            aria-label="Scheduled release date"
          />
        </Field>
        <Field label="Prerequisite week">
          <input
            type="number"
            min={1}
            max={module.week - 1 || 1}
            value={release.prerequisiteWeek ?? ""}
            onChange={(e) =>
              updateContent({
                releaseSettings: {
                  ...release,
                  prerequisiteWeek: e.target.value ? Number(e.target.value) : null,
                },
              })
            }
            className={inputClass}
            aria-label="Prerequisite week number"
          />
        </Field>
        <div className="sm:col-span-2 flex items-center gap-3">
          <input
            id="settings-released"
            type="checkbox"
            checked={module.isReleased}
            onChange={(e) => updateModule({ isReleased: e.target.checked })}
            aria-label="Release module to students"
          />
          <label htmlFor="settings-released" className="text-xs font-bold">
            Visible in student LMS
          </label>
        </div>
      </div>
    </div>
  );
}

function PreviewTab({
  projection,
}: {
  projection: {
    week: number;
    title: string;
    description: string;
    objectives: string;
    outcomes: string[];
    lessons: ModuleLesson[];
    resources: ModuleResource[];
    videos: ModuleVideo[];
    notes: string;
    quiz: AdminModuleDetail["content"]["quiz"];
    assignment: AdminModuleDetail["content"]["assignment"];
    links: ExternalLink[];
    visible: boolean;
  };
}) {
  return (
    <div className="space-y-6">
      <SectionTitle
        title="LMS Preview"
        subtitle={
          projection.visible
            ? "This module is published - students see the content below"
            : "Draft / hidden - students will NOT see this until published"
        }
      />
      <div className="rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-lg bg-[#2563EB] px-2 py-1 text-[10px] font-bold text-white dark:bg-[#60A5FA] dark:text-[#070B19]">
            W{projection.week}
          </span>
          {!projection.visible && (
            <span className="rounded-full bg-[#F59E0B]/15 px-2 py-0.5 text-[9px] font-bold uppercase text-[#B45309]">
              Hidden from LMS
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-[#0D1B2A] dark:text-white">{projection.title}</h3>
        <p className="mt-1 text-sm text-[#6B6558] dark:text-slate-400">{projection.description}</p>
        {projection.objectives && (
          <p className="mt-3 text-xs text-[#0D1B2A] dark:text-slate-300">
            <strong>Objectives:</strong> {projection.objectives}
          </p>
        )}
        {projection.outcomes.length > 0 && (
          <ul className="mt-3 space-y-1">
            {projection.outcomes.map((o, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-[#6B6558] dark:text-slate-400">
                <FaCircleCheck className="mt-0.5 h-3 w-3 text-[#10B981]" /> {o}
              </li>
            ))}
          </ul>
        )}
        {projection.lessons.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6558]">Lessons</p>
            {projection.lessons.map((l) => (
              <p key={l.id} className="text-xs font-medium text-[#0D1B2A] dark:text-white">
                {l.title} · {l.type} · {l.duration ?? "-"} mins
              </p>
            ))}
          </div>
        )}
        {(projection.resources.length > 0 || projection.videos.length > 0) && (
          <p className="mt-3 text-xs text-[#6B6558]">
            {projection.resources.length} resources · {projection.videos.length} videos
          </p>
        )}
        {projection.notes && (
          <div className="mt-4 rounded-xl bg-black/5 p-3 text-xs dark:bg-white/5">
            <p className="font-bold">Instructor Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-[#6B6558] dark:text-slate-400">{projection.notes}</p>
          </div>
        )}
        {projection.assignment && (
          <p className="mt-3 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">
            Assignment: {projection.assignment.title}
          </p>
        )}
        {projection.quiz && (
          <p className="mt-1 text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">
            Quiz: {projection.quiz.name} ({projection.quiz.passingPercentage}% to pass)
          </p>
        )}
        {projection.links.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {projection.links.map((link) => (
              <span key={link.id} className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2563EB]">
                <FaLink className="h-3 w-3" /> {link.title}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExternalLinksSection({
  links,
  onChange,
}: {
  links: ExternalLink[];
  onChange: (links: ExternalLink[]) => void;
}) {
  return (
    <div className="space-y-3 border-t border-black/10 pt-6 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0D1B2A] dark:text-white">External Links</h3>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...links,
              { id: newId("link"), title: "", url: "", description: "" },
            ])
          }
          aria-label="Add external link"
          className={secondaryBtn}
        >
          <FaPlus className="h-3 w-3" /> Add Link
        </button>
      </div>
      {links.map((link, idx) => (
        <div key={link.id} className="grid gap-2 sm:grid-cols-3">
          <input
            value={link.title}
            onChange={(e) =>
              onChange(links.map((l) => (l.id === link.id ? { ...l, title: e.target.value } : l)))
            }
            placeholder="Link title"
            className={inputClass}
            aria-label={`External link ${idx + 1} title`}
          />
          <input
            type="url"
            value={link.url}
            onChange={(e) =>
              onChange(links.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)))
            }
            placeholder="URL"
            className={inputClass}
            aria-label={`External link ${idx + 1} URL`}
          />
          <div className="flex gap-2">
            <input
              value={link.description}
              onChange={(e) =>
                onChange(
                  links.map((l) => (l.id === link.id ? { ...l, description: e.target.value } : l))
                )
              }
              placeholder="Description"
              className={inputClass}
              aria-label={`External link ${idx + 1} description`}
            />
            <IconBtn
              label={`Delete link ${idx + 1}`}
              onClick={() => onChange(links.filter((l) => l.id !== link.id))}
              danger
            >
              <FaTrash className="h-3 w-3" />
            </IconBtn>
          </div>
        </div>
      ))}
    </div>
  );
}

function CodeExamplesSection({
  examples,
  onChange,
}: {
  examples: CodeExample[];
  onChange: (examples: CodeExample[]) => void;
}) {
  return (
    <div className="space-y-3 border-t border-black/10 pt-6 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0D1B2A] dark:text-white">Code Examples</h3>
        <button
          type="button"
          onClick={() =>
            onChange([...examples, { id: newId("code"), title: "", language: "PYTHON", code: "" }])
          }
          aria-label="Add code example"
          className={secondaryBtn}
        >
          <FaPlus className="h-3 w-3" /> Add Code
        </button>
      </div>
      {examples.map((ex, idx) => (
        <div key={ex.id} className="space-y-2 rounded-xl border border-black/10 p-3 dark:border-white/10">
          <div className="flex gap-2">
            <input
              value={ex.title}
              onChange={(e) =>
                onChange(examples.map((x) => (x.id === ex.id ? { ...x, title: e.target.value } : x)))
              }
              placeholder="Example title"
              className={inputClass}
              aria-label={`Code example ${idx + 1} title`}
            />
            <select
              value={ex.language}
              onChange={(e) =>
                onChange(
                  examples.map((x) =>
                    x.id === ex.id ? { ...x, language: e.target.value as CodeExample["language"] } : x
                  )
                )
              }
              className={inputClass}
              aria-label={`Code example ${idx + 1} language`}
            >
              {CODE_LANGS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <IconBtn
              label={`Delete code example ${idx + 1}`}
              onClick={() => onChange(examples.filter((x) => x.id !== ex.id))}
              danger
            >
              <FaTrash className="h-3 w-3" />
            </IconBtn>
          </div>
          <textarea
            rows={6}
            value={ex.code}
            onChange={(e) =>
              onChange(examples.map((x) => (x.id === ex.id ? { ...x, code: e.target.value } : x)))
            }
            placeholder="Paste code…"
            className={`${inputClass} font-mono text-[11px]`}
            aria-label={`Code example ${idx + 1} source`}
          />
        </div>
      ))}
    </div>
  );
}

function ImagesSection({
  images,
  onChange,
}: {
  images: AdminModuleDetail["content"]["images"];
  onChange: (images: AdminModuleDetail["content"]["images"]) => void;
}) {
  return (
    <div className="space-y-3 border-t border-black/10 pt-6 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#0D1B2A] dark:text-white">Supporting Images</h3>
        <button
          type="button"
          onClick={() =>
            onChange([
              ...images,
              { id: newId("img"), title: "", caption: "", altText: "", fileUrl: "" },
            ])
          }
          aria-label="Add image"
          className={secondaryBtn}
        >
          <FaPlus className="h-3 w-3" /> Add Image
        </button>
      </div>
      {images.map((img, idx) => (
        <div key={img.id} className="grid gap-2 sm:grid-cols-2">
          <input
            value={img.title}
            onChange={(e) =>
              onChange(images.map((x) => (x.id === img.id ? { ...x, title: e.target.value } : x)))
            }
            placeholder="Title"
            className={inputClass}
            aria-label={`Image ${idx + 1} title`}
          />
          <input
            type="url"
            value={img.fileUrl}
            onChange={(e) =>
              onChange(images.map((x) => (x.id === img.id ? { ...x, fileUrl: e.target.value } : x)))
            }
            placeholder="Image URL"
            className={inputClass}
            aria-label={`Image ${idx + 1} URL`}
          />
          <input
            value={img.altText}
            onChange={(e) =>
              onChange(images.map((x) => (x.id === img.id ? { ...x, altText: e.target.value } : x)))
            }
            placeholder="Alt text"
            className={inputClass}
            aria-label={`Image ${idx + 1} alt text`}
          />
          <div className="flex gap-2">
            <input
              value={img.caption}
              onChange={(e) =>
                onChange(images.map((x) => (x.id === img.id ? { ...x, caption: e.target.value } : x)))
              }
              placeholder="Caption"
              className={inputClass}
              aria-label={`Image ${idx + 1} caption`}
            />
            <IconBtn
              label={`Delete image ${idx + 1}`}
              onClick={() => onChange(images.filter((x) => x.id !== img.id))}
              danger
            >
              <FaTrash className="h-3 w-3" />
            </IconBtn>
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsPanel({ analytics }: { analytics: AdminModuleDetail["analytics"] }) {
  const stats = [
    { label: "Total Students", value: analytics.totalStudents },
    { label: "Completion Rate", value: `${analytics.completionRate}%` },
    { label: "Avg Quiz Score", value: `${analytics.averageQuizScore}%` },
    { label: "Drop-off Rate", value: `${analytics.dropOffRate}%` },
    { label: "Avg Watch Time", value: `${analytics.averageWatchMinutes} min` },
  ];

  return (
    <div className="rounded-2xl border border-black/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
      <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
        Module Analytics (post-publish)
      </p>
      <div className="grid gap-3 sm:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-black/5 p-3 dark:bg-white/5">
            <p className="text-[10px] font-bold uppercase text-[#6B6558] dark:text-slate-500">{stat.label}</p>
            <p className="text-lg font-extrabold text-[#0D1B2A] dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-sm font-extrabold text-[#0D1B2A] dark:text-white">{title}</h2>
      {subtitle && <p className="text-[11px] text-[#6B6558] dark:text-slate-400">{subtitle}</p>}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`rounded p-1.5 hover:bg-black/5 disabled:opacity-30 dark:hover:bg-white/10 ${
        danger ? "text-red-600 dark:text-red-400" : ""
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-black/20 p-8 text-center dark:border-white/20">
      <Icon className="h-10 w-10 text-[#2563EB]/30 dark:text-[#60A5FA]/30" />
      <p className="text-xs text-[#6B6558] dark:text-slate-400">{message}</p>
    </div>
  );
}

const labelClass =
  "mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#6B6558] dark:text-slate-400";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#2563EB] px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-white hover:bg-[#1d4ed8] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]";

const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#6B6558] hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5";

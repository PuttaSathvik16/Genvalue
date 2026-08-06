"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaPencil,
  FaTrash,
  FaX,
  FaClock,
  FaFloppyDisk,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa6";
import {
  createAdminAssignment,
  deleteAdminAssignment,
  listAdminAssignments,
  updateAdminAssignment,
  type AdminAssignmentRecord,
} from "@/services/adminService";
import { ChoiceQuestionFields } from "@/components/admin/ChoiceQuestionFields";
import {
  newQuizQuestion,
  normalizeQuestion,
  questionTypeLabel,
  validateQuizQuestionsList,
  type BaseQuizQuestion,
  type QuizQuestionType,
} from "@/lib/quizQuestions";
import { useAdminPortalPath } from "@/hooks/useAdminPortalPath";
import { AssignmentsListSkeleton } from "@/components/skeletons";

type AssignmentQuestion = BaseQuizQuestion;

interface Assignment {
  id: string;
  week: number;
  title: string;
  description: string;
  instructions?: string;
  type: "PDF" | "MCQ" | "MIXED";
  isRequired: boolean;
  questions: AssignmentQuestion[];
  passingScore?: number;
  dueDate: string;
  status: string;
  createdAt: string;
}

function parseQuestions(raw: unknown): AssignmentQuestion[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((q, idx) => normalizeQuestion(q as Record<string, unknown>, idx));
  } catch {
    return [];
  }
}

function normalizeAssignment(raw: AdminAssignmentRecord | Record<string, unknown>): Assignment {
  return {
    id: String(raw.id),
    week: Number(raw.week),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    instructions: raw.instructions ? String(raw.instructions) : undefined,
    type: (raw.type as Assignment["type"]) ?? "PDF",
    isRequired: raw.isRequired !== false,
    questions: parseQuestions(raw.questions),
    passingScore: raw.passingScore != null ? Number(raw.passingScore) : 70,
    dueDate: String(raw.dueDate),
    status: String(raw.status ?? "ACTIVE"),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

function newQuestion(type: QuizQuestionType = "SINGLE_CHOICE"): AssignmentQuestion {
  return newQuizQuestion(type);
}

function validateAssignment(assignment: Assignment): string | null {
  if (!assignment.title.trim()) return "Title is required";
  if (assignment.type === "MCQ" || assignment.type === "MIXED") {
    return validateQuizQuestionsList(assignment.questions);
  }
  return null;
}

export default function AdminAssignmentsPage() {
  const { toPortal } = useAdminPortalPath();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminAssignments();
      setAssignments(data.map(normalizeAssignment));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load assignments");
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleCreateNew = () => {
    setEditingAssignment({
      id: `assignment-${Date.now()}`,
      week: 1,
      title: "",
      description: "",
      instructions: "",
      type: "PDF",
      isRequired: true,
      questions: [],
      passingScore: 70,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    });
    setCreatingNew(true);
    setError(null);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment({ ...assignment, questions: [...assignment.questions] });
    setCreatingNew(false);
    setError(null);
  };

  const updateQuestion = (questionId: string, patch: Partial<AssignmentQuestion>) => {
    if (!editingAssignment) return;
    setEditingAssignment({
      ...editingAssignment,
      questions: editingAssignment.questions.map((q) =>
        q.id === questionId ? { ...q, ...patch } : q
      ),
    });
  };

  const addQuestion = (type: QuizQuestionType = "SINGLE_CHOICE") => {
    if (!editingAssignment) return;
    setEditingAssignment({
      ...editingAssignment,
      questions: [...editingAssignment.questions, newQuestion(type)],
    });
  };

  const setQuestionType = (questionId: string, type: QuizQuestionType) => {
    if (!editingAssignment) return;
    const replacement = newQuestion(type);
    updateQuestion(questionId, {
      type: replacement.type,
      options: replacement.options,
      correctAnswer: replacement.correctAnswer,
    });
  };

  const removeQuestion = (questionId: string) => {
    if (!editingAssignment) return;
    setEditingAssignment({
      ...editingAssignment,
      questions: editingAssignment.questions.filter((q) => q.id !== questionId),
    });
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    if (!editingAssignment) return;
    const next = [...editingAssignment.questions];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setEditingAssignment({ ...editingAssignment, questions: next });
  };

  const handleTypeChange = (type: Assignment["type"]) => {
    if (!editingAssignment) return;
    const next = { ...editingAssignment, type };
    if ((type === "MCQ" || type === "MIXED") && next.questions.length === 0) {
      next.questions = [newQuestion("SINGLE_CHOICE")];
    }
    if (type === "PDF") {
      next.questions = [];
    }
    setEditingAssignment(next);
  };

  const handleSaveAssignment = async () => {
    if (!editingAssignment) return;

    const validationError = validateAssignment(editingAssignment);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const needsQuestions = editingAssignment.type === "MCQ" || editingAssignment.type === "MIXED";

      const payload = {
        week: editingAssignment.week,
        title: editingAssignment.title.trim(),
        description: editingAssignment.description,
        instructions: editingAssignment.instructions,
        type: editingAssignment.type,
        isRequired: editingAssignment.isRequired,
        questions: needsQuestions ? editingAssignment.questions : [],
        passingScore: needsQuestions ? editingAssignment.passingScore : undefined,
        dueDate: editingAssignment.dueDate,
        status: editingAssignment.status,
      };

      const saved = creatingNew
        ? await createAdminAssignment(payload)
        : await updateAdminAssignment(editingAssignment.id, payload);

      const normalized = normalizeAssignment(saved);

      if (creatingNew) {
        setAssignments((prev) => [...prev, normalized]);
      } else {
        setAssignments((prev) => prev.map((a) => (a.id === normalized.id ? normalized : a)));
      }

      setEditingAssignment(null);
      setCreatingNew(false);
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save assignment");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await deleteAdminAssignment(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete assignment");
    }
  };

  const showQuestionEditor =
    editingAssignment?.type === "MCQ" || editingAssignment?.type === "MIXED";

  if (loading) {
    return <AssignmentsListSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ ADMIN CONTROL
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#0D1B2A] dark:text-white sm:text-3xl">
            Manage Assignments
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Create PDF, MCQ, or mixed assignments with inline question builder for each week.
          </p>
        </div>
        <Link
          href={toPortal("/admin/submissions")}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#2563EB] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1D4ED8]"
          aria-label="Open submission records to evaluate student work"
        >
          Evaluate submissions
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchAssignments()}
            aria-label="Retry loading assignments"
            className="mt-2 text-xs font-extrabold uppercase tracking-wider underline"
          >
            Retry
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleCreateNew}
        aria-label="Create new assignment"
        className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#1d4ed8] dark:bg-[#60A5FA] dark:text-[#070B19]"
      >
        <FaPlus className="h-4 w-4" /> Create Assignment
      </button>

      {editingAssignment && (
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display-custom text-xl font-bold text-[#0D1B2A] dark:text-white">
              {creatingNew ? "Create New Assignment" : "Edit Assignment"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingAssignment(null);
                setCreatingNew(false);
                setError(null);
              }}
              aria-label="Close assignment editor"
              className="text-[#6B6558] hover:text-[#0D1B2A] dark:text-slate-400 dark:hover:text-white"
            >
              <FaX className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="assignment-week" className={labelClass}>Week</label>
                <input
                  id="assignment-week"
                  type="number"
                  min={1}
                  max={12}
                  value={editingAssignment.week}
                  onChange={(e) =>
                    setEditingAssignment({ ...editingAssignment, week: parseInt(e.target.value, 10) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="assignment-type" className={labelClass}>Type</label>
                <select
                  id="assignment-type"
                  value={editingAssignment.type}
                  onChange={(e) => handleTypeChange(e.target.value as Assignment["type"])}
                  className={inputClass}
                >
                  <option value="PDF">PDF Submission</option>
                  <option value="MCQ">Quiz (MCQ)</option>
                  <option value="MIXED">Mixed (PDF + Quiz)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="assignment-title" className={labelClass}>Title</label>
              <input
                id="assignment-title"
                type="text"
                required
                value={editingAssignment.title}
                onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="assignment-description" className={labelClass}>Description</label>
              <textarea
                id="assignment-description"
                value={editingAssignment.description}
                onChange={(e) =>
                  setEditingAssignment({ ...editingAssignment, description: e.target.value })
                }
                rows={3}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="assignment-instructions" className={labelClass}>Instructions</label>
              <textarea
                id="assignment-instructions"
                value={editingAssignment.instructions || ""}
                onChange={(e) =>
                  setEditingAssignment({ ...editingAssignment, instructions: e.target.value })
                }
                rows={2}
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="assignment-due" className={labelClass}>Due Date</label>
                <input
                  id="assignment-due"
                  type="datetime-local"
                  value={new Date(editingAssignment.dueDate).toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setEditingAssignment({
                      ...editingAssignment,
                      dueDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  className={inputClass}
                />
              </div>
              {showQuestionEditor && (
                <div>
                  <label htmlFor="assignment-passing" className={labelClass}>Passing Score %</label>
                  <input
                    id="assignment-passing"
                    type="number"
                    min={0}
                    max={100}
                    value={editingAssignment.passingScore ?? 70}
                    onChange={(e) =>
                      setEditingAssignment({
                        ...editingAssignment,
                        passingScore: parseInt(e.target.value, 10),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            {showQuestionEditor && (
              <section className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0D1B2A] dark:text-white">
                      Quiz Questions ({editingAssignment.questions.length})
                    </h3>
                    <p className="text-[11px] text-[#6B6558] dark:text-slate-400">
                      Single choice = radio · Multiple choice = checkboxes
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => addQuestion("SINGLE_CHOICE")} aria-label="Add single choice" className={addBtnClass}>
                      + Single
                    </button>
                    <button type="button" onClick={() => addQuestion("MULTIPLE_CHOICE")} aria-label="Add multiple choice" className={addBtnClass}>
                      + Multiple
                    </button>
                    <button type="button" onClick={() => addQuestion("TRUE_FALSE")} aria-label="Add true false" className={addBtnClass}>
                      + T/F
                    </button>
                    <button type="button" onClick={() => addQuestion("SHORT_ANSWER")} aria-label="Add short answer" className={addBtnClass}>
                      + Short
                    </button>
                  </div>
                </div>

                {editingAssignment.questions.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-black/20 p-6 text-center text-xs text-[#6B6558] dark:border-white/20 dark:text-slate-400">
                    No questions yet. Click &quot;Add Question&quot; to build the quiz.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {editingAssignment.questions.map((question, idx) => (
                      <QuestionEditor
                        key={question.id}
                        question={question}
                        index={idx}
                        total={editingAssignment.questions.length}
                        onUpdate={(patch) => updateQuestion(question.id, patch)}
                        onTypeChange={(type) => setQuestionType(question.id, type)}
                        onRemove={() => removeQuestion(question.id)}
                        onMove={(dir) => moveQuestion(idx, dir)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            <div className="flex items-center gap-3">
              <input
                id="assignment-required"
                type="checkbox"
                checked={editingAssignment.isRequired}
                onChange={(e) =>
                  setEditingAssignment({ ...editingAssignment, isRequired: e.target.checked })
                }
                className="h-4 w-4 cursor-pointer"
                aria-label="Required assignment"
              />
              <label htmlFor="assignment-required" className={labelClass}>
                Required Assignment
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleSaveAssignment}
                disabled={saving}
                aria-label="Save assignment"
                className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-[#0d9668] disabled:opacity-50"
              >
                <FaFloppyDisk className="h-4 w-4" /> {saving ? "Saving..." : "Save Assignment"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingAssignment(null);
                  setCreatingNew(false);
                  setError(null);
                }}
                aria-label="Cancel editing"
                className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#6B6558] hover:bg-black/5 dark:border-white/20 dark:bg-white/5 dark:text-slate-300"
              >
                <FaX className="h-4 w-4" /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <FaClock className="h-16 w-16 text-[#2563EB]/30 dark:text-[#60A5FA]/30" />
          <div>
            <h2 className="font-display-custom text-2xl font-bold text-[#0D1B2A] dark:text-white">
              No Assignments Yet
            </h2>
            <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-400">
              Create your first assignment to get started
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-4 dark:border-white/10 dark:bg-[#0D1B2A]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E8622E]">
                      Week {assignment.week}
                    </span>
                    <span className="inline-block rounded-full bg-[#2563EB]/10 px-3 py-1 text-xs font-bold text-[#2563EB] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]">
                      {assignment.type}
                    </span>
                    {(assignment.type === "MCQ" || assignment.type === "MIXED") && (
                      <span className="text-[10px] font-bold text-[#6B6558] dark:text-slate-400">
                        {assignment.questions.length} question
                        {assignment.questions.length !== 1 ? "s" : ""}
                        {assignment.passingScore != null && ` · ${assignment.passingScore}% to pass`}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display-custom mt-1 text-base font-bold text-[#0D1B2A] dark:text-white">
                    {assignment.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#6B6558] dark:text-slate-400">{assignment.description}</p>
                  <p className="mt-2 text-xs font-medium text-[#6B6558] dark:text-slate-400">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditAssignment(assignment)}
                    aria-label={`Edit assignment ${assignment.title}`}
                    className="rounded-full bg-[#2563EB] p-2.5 text-white hover:bg-[#1d4ed8] dark:bg-[#60A5FA] dark:text-[#070B19]"
                  >
                    <FaPencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    aria-label={`Delete assignment ${assignment.title}`}
                    className="rounded-full bg-red-500 p-2.5 text-white hover:bg-red-600"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionEditor({
  question,
  index,
  total,
  onUpdate,
  onTypeChange,
  onRemove,
  onMove,
}: {
  question: AssignmentQuestion;
  index: number;
  total: number;
  onUpdate: (patch: Partial<AssignmentQuestion>) => void;
  onTypeChange: (type: QuizQuestionType) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#0D1B2A]/50">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
          Q{index + 1} · {questionTypeLabel(question.type)}
        </span>
        <div className="flex gap-1">
          <IconButton label="Move question up" onClick={() => onMove(-1)} disabled={index === 0}>
            <FaArrowUp className="h-3 w-3" />
          </IconButton>
          <IconButton label="Move question down" onClick={() => onMove(1)} disabled={index === total - 1}>
            <FaArrowDown className="h-3 w-3" />
          </IconButton>
          <IconButton label="Delete question" onClick={onRemove} danger>
            <FaTrash className="h-3 w-3" />
          </IconButton>
        </div>
      </div>

      <textarea
        value={question.question}
        onChange={(e) => onUpdate({ question: e.target.value })}
        placeholder="Enter the question…"
        rows={2}
        aria-label={`Question ${index + 1} text`}
        className={`${inputClass} mb-3`}
      />

      <ChoiceQuestionFields
        question={question}
        index={index}
        onUpdate={onUpdate}
        onTypeChange={onTypeChange}
      />
    </div>
  );
}

function IconButton({
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

const labelClass =
  "block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-300";

const inputClass =
  "mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-medium outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

const addBtnClass =
  "inline-flex items-center gap-1 rounded-full border border-[#2563EB]/30 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] hover:bg-[#2563EB]/10 dark:border-[#60A5FA]/30 dark:text-[#60A5FA]";

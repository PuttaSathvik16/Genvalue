"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaPencil,
  FaTrash,
  FaX,
  FaCircleCheck,
  FaFloppyDisk,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa6";
import {
  createAdminQuiz,
  deleteAdminQuiz,
  listAdminQuizzes,
  updateAdminQuiz,
  type AdminQuizRecord,
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
import { AssignmentsListSkeleton } from "@/components/skeletons";

type QuizQuestion = BaseQuizQuestion;

interface Quiz {
  id: string;
  week: number;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  questions: QuizQuestion[];
}

function parseQuestions(raw: unknown): QuizQuestion[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((q, idx) => normalizeQuestion(q as Record<string, unknown>, idx));
  } catch {
    return [];
  }
}

function normalizeQuiz(raw: AdminQuizRecord): Quiz {
  return {
    id: raw.id,
    week: raw.week,
    title: raw.title,
    description: raw.description,
    duration: raw.duration,
    passingScore: raw.passingScore,
    questions: parseQuestions(raw.questions),
  };
}

function validateQuiz(quiz: Quiz): string | null {
  if (!quiz.title.trim()) return "Quiz title is required";
  if (!quiz.description.trim()) return "Quiz description is required";
  return validateQuizQuestionsList(quiz.questions);
}

export default function AdminQuizzesPage() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAdminQuizzes();
      setQuizzes(data.map(normalizeQuiz));
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load quizzes");
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleCreateNewQuiz = () => {
    setEditingQuiz({
      id: `quiz-${Date.now()}`,
      week: 1,
      title: "",
      description: "",
      duration: 15,
      passingScore: 70,
      questions: [newQuizQuestion("SINGLE_CHOICE")],
    });
    setCreatingNew(true);
    setError(null);
    setSuccess(null);
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz({ ...quiz, questions: quiz.questions.map((q) => ({ ...q, options: [...q.options] })) });
    setCreatingNew(false);
    setError(null);
    setSuccess(null);
  };

  const updateQuestion = (questionId: string, patch: Partial<QuizQuestion>) => {
    if (!editingQuiz) return;
    setEditingQuiz({
      ...editingQuiz,
      questions: editingQuiz.questions.map((q) => (q.id === questionId ? { ...q, ...patch } : q)),
    });
  };

  const setQuestionType = (questionId: string, type: QuizQuestionType) => {
    if (!editingQuiz) return;
    const replacement = newQuizQuestion(type);
    updateQuestion(questionId, {
      type: replacement.type,
      options: replacement.options,
      correctAnswer: replacement.correctAnswer,
    });
  };

  const handleSaveQuiz = async () => {
    if (!editingQuiz) return;

    const validationError = validateQuiz(editingQuiz);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        week: editingQuiz.week,
        title: editingQuiz.title.trim(),
        description: editingQuiz.description.trim(),
        duration: editingQuiz.duration,
        passingScore: editingQuiz.passingScore,
        questions: editingQuiz.questions,
      };

      const saved = creatingNew
        ? await createAdminQuiz(payload)
        : await updateAdminQuiz(editingQuiz.id, payload);

      const normalized = normalizeQuiz(saved);

      if (creatingNew) {
        setQuizzes((prev) => [...prev, normalized]);
      } else {
        setQuizzes((prev) => prev.map((q) => (q.id === normalized.id ? normalized : q)));
      }

      setSuccess("Quiz saved successfully");
      setEditingQuiz(null);
      setCreatingNew(false);
    } catch (err) {
      console.error("Save error:", err);
      setError(err instanceof Error ? err.message : "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    try {
      await deleteAdminQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      setSuccess("Quiz deleted");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "Failed to delete quiz");
    }
  };

  if (loading) {
    return <AssignmentsListSkeleton count={4} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ ADMIN PANEL
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#0D1B2A] dark:text-white sm:text-3xl">
            Manage Quizzes
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Build single choice (radio), multiple choice (checkboxes), True/False, and short answer questions.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateNewQuiz}
          aria-label="Create new quiz"
          className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1d4ed8] dark:bg-[#60A5FA] dark:text-[#070B19]"
        >
          <FaPlus className="h-4 w-4" />
          Create Quiz
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => fetchQuizzes()}
            aria-label="Retry loading quizzes"
            className="mt-2 text-xs font-extrabold uppercase tracking-wider underline"
          >
            Retry
          </button>
        </div>
      )}

      {success && !editingQuiz && (
        <div className="rounded-2xl border border-[#10B981]/20 bg-[#10B981]/10 p-4 text-sm font-bold text-[#0d9668] dark:text-[#10B981]">
          {success}
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <FaCircleCheck className="h-16 w-16 text-[#2563EB]/30 dark:text-[#60A5FA]/30" />
          <div>
            <h2 className="font-display-custom text-2xl font-bold text-[#0D1B2A] dark:text-white">
              No Quizzes Created Yet
            </h2>
            <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-400">
              Create your first quiz to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-black/10 bg-white/60 p-5 shadow-lg dark:border-white/10 dark:bg-white/10"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB] text-xs font-bold text-white dark:bg-[#60A5FA] dark:text-[#070B19]">
                  W{quiz.week}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditQuiz(quiz)}
                    aria-label={`Edit quiz ${quiz.title}`}
                    className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <FaPencil className="h-4 w-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    aria-label={`Delete quiz ${quiz.title}`}
                    className="rounded-lg p-2 hover:bg-red-100 dark:hover:bg-red-900/30"
                  >
                    <FaTrash className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-[#0D1B2A] dark:text-white">{quiz.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-[#6B6558] dark:text-slate-400">{quiz.description}</p>

              <div className="mt-3 space-y-1 text-[10px] font-bold text-[#6B6558] dark:text-slate-400">
                <p>Duration: {quiz.duration} mins</p>
                <p>Pass Score: {quiz.passingScore}%</p>
                <p>Questions: {quiz.questions.length}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {editingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-black/10 bg-[#F6F1E4] p-8 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-editor-title"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2
                id="quiz-editor-title"
                className="font-display-custom text-2xl font-extrabold text-[#0D1B2A] dark:text-white"
              >
                {creatingNew ? "Create New Quiz" : `Edit Quiz - Week ${editingQuiz.week}`}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setEditingQuiz(null);
                  setCreatingNew(false);
                  setError(null);
                }}
                aria-label="Close quiz editor"
                className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <FaX className="h-5 w-5 text-[#0D1B2A] dark:text-white" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quiz-week" className={labelClass}>Week Number</label>
                  <select
                    id="quiz-week"
                    value={editingQuiz.week}
                    onChange={(e) => setEditingQuiz({ ...editingQuiz, week: parseInt(e.target.value, 10) })}
                    className={inputClass}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((week) => (
                      <option key={week} value={week}>Week {week}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="quiz-duration" className={labelClass}>Duration (minutes)</label>
                  <input
                    id="quiz-duration"
                    type="number"
                    min={1}
                    value={editingQuiz.duration}
                    onChange={(e) =>
                      setEditingQuiz({ ...editingQuiz, duration: parseInt(e.target.value, 10) || 1 })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quiz-title" className={labelClass}>Quiz Title</label>
                <input
                  id="quiz-title"
                  type="text"
                  value={editingQuiz.title}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="quiz-description" className={labelClass}>Description</label>
                <textarea
                  id="quiz-description"
                  value={editingQuiz.description}
                  onChange={(e) => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                  rows={2}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="quiz-passing" className={labelClass}>Passing Score (%)</label>
                <input
                  id="quiz-passing"
                  type="number"
                  min={0}
                  max={100}
                  value={editingQuiz.passingScore}
                  onChange={(e) =>
                    setEditingQuiz({ ...editingQuiz, passingScore: parseInt(e.target.value, 10) || 0 })
                  }
                  className={inputClass}
                />
              </div>

              <section className="rounded-2xl border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0D1B2A] dark:text-white">
                      Questions ({editingQuiz.questions.length})
                    </h3>
                    <p className="text-[11px] text-[#6B6558] dark:text-slate-400">
                      Single · Multiple · T/F · Short
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuiz({
                          ...editingQuiz,
                          questions: [...editingQuiz.questions, newQuizQuestion("SINGLE_CHOICE")],
                        })
                      }
                      aria-label="Add single choice question"
                      className={addBtnClass}
                    >
                      + Single
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuiz({
                          ...editingQuiz,
                          questions: [...editingQuiz.questions, newQuizQuestion("MULTIPLE_CHOICE")],
                        })
                      }
                      aria-label="Add multiple choice question"
                      className={addBtnClass}
                    >
                      + Multiple
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuiz({
                          ...editingQuiz,
                          questions: [...editingQuiz.questions, newQuizQuestion("TRUE_FALSE")],
                        })
                      }
                      aria-label="Add true false question"
                      className={addBtnClass}
                    >
                      + T/F
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingQuiz({
                          ...editingQuiz,
                          questions: [...editingQuiz.questions, newQuizQuestion("SHORT_ANSWER")],
                        })
                      }
                      aria-label="Add short answer question"
                      className={addBtnClass}
                    >
                      + Short
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {editingQuiz.questions.map((question, idx) => (
                    <QuizQuestionEditor
                      key={question.id}
                      question={question}
                      index={idx}
                      total={editingQuiz.questions.length}
                      onUpdate={(patch) => updateQuestion(question.id, patch)}
                      onTypeChange={(type) => setQuestionType(question.id, type)}
                      onRemove={() =>
                        setEditingQuiz({
                          ...editingQuiz,
                          questions: editingQuiz.questions.filter((q) => q.id !== question.id),
                        })
                      }
                      onMove={(dir) => {
                        const next = [...editingQuiz.questions];
                        const target = idx + dir;
                        if (target < 0 || target >= next.length) return;
                        [next[idx], next[target]] = [next[target], next[idx]];
                        setEditingQuiz({ ...editingQuiz, questions: next });
                      }}
                    />
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-8 flex gap-3 border-t border-black/10 pt-6 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  setEditingQuiz(null);
                  setCreatingNew(false);
                  setError(null);
                }}
                className="flex-1 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold text-[#0D1B2A] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuiz}
                disabled={saving}
                aria-label="Save quiz"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1d4ed8] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]"
              >
                <FaFloppyDisk className="h-4 w-4" />
                {saving ? "Saving..." : "Save Quiz"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function QuizQuestionEditor({
  question,
  index,
  total,
  onUpdate,
  onTypeChange,
  onRemove,
  onMove,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  onUpdate: (patch: Partial<QuizQuestion>) => void;
  onTypeChange: (type: QuizQuestionType) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-[#0D1B2A]/40">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA]">
          Q{index + 1} · {questionTypeLabel(question.type)}
        </span>
        <div className="flex gap-1">
          <IconButton label="Move up" onClick={() => onMove(-1)} disabled={index === 0}>
            <FaArrowUp className="h-3 w-3" />
          </IconButton>
          <IconButton label="Move down" onClick={() => onMove(1)} disabled={index === total - 1}>
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
        placeholder="Enter question text…"
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
  "mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-[#6B6558] dark:text-slate-400";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-medium outline-none focus:border-[#2563EB] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

const addBtnClass =
  "inline-flex items-center gap-1 rounded-full border border-[#2563EB]/30 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#2563EB] hover:bg-[#2563EB]/10 dark:border-[#60A5FA]/30 dark:text-[#60A5FA]";

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaBookOpen, FaArrowRight, FaListCheck, FaClock, FaCheck, FaPlay } from "react-icons/fa6";
import { getAuthTokenWithRefresh } from "@/services/authService";
import { StudentChoiceInput } from "@/components/quiz/StudentChoiceInput";
import { isChoiceQuestion } from "@/lib/quizQuestions";
import { AssignmentsListSkeleton } from "@/components/skeletons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface QuizQuestion {
  id: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  question: string;
  options?: string[];
  correctAnswer: string | number | number[] | boolean;
  points: number;
}

interface Quiz {
  id: string;
  week: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  duration: number;
  passingScore: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  score?: number;
  attempts: number;
}

export default function QuizzesPage() {
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enrolledWeeks, setEnrolledWeeks] = useState<number[]>([]);
  const [takingQuiz, setTakingQuiz] = useState<string | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Get token with automatic refresh
        const authToken = await getAuthTokenWithRefresh();

        if (!authToken) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Load enrolled weeks from localStorage
        const savedCompleted = localStorage.getItem("completedWeeks");
        if (savedCompleted) {
          setEnrolledWeeks(JSON.parse(savedCompleted));
        }

        // Fetch all quizzes from backend
        const response = await fetch(`${API_URL}/quizzes`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const quizzesData = data.data || [];
          
          // Map quizzes to include status and attempts
          const enrichedQuizzes = quizzesData.map((quiz: any) => ({
            ...quiz,
            status: "NOT_STARTED" as const,
            attempts: 0,
          }));
          
          setQuizzes(enrichedQuizzes);
        } else if (response.status === 404) {
          // No quizzes created yet, show empty state
          setQuizzes([]);
        } else if (response.status === 401) {
          setError("Session expired. Please log in again.");
        } else {
          setError("Failed to load quizzes");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        // Don't show error for missing endpoint, just show empty state
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (quiz) {
      setTakingQuiz(quizId);
      setCurrentAnswers({});
    }
  };

  const handleSubmitQuiz = async (quizId: string) => {
    try {
      // Get token with automatic refresh
      const authToken = await getAuthTokenWithRefresh();
      
      if (!authToken) {
        alert("Session expired. Please log in again.");
        return;
      }
      
      const response = await fetch(`${API_URL}/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          quizId,
          answers: currentAnswers,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const score = data.data.score;
        
        alert(`Quiz submitted! Your score: ${score}%`);
        
        // Update quiz status
        setQuizzes(
          quizzes.map((q) =>
            q.id === quizId
              ? {
                  ...q,
                  status: score >= q.passingScore ? "COMPLETED" : "IN_PROGRESS",
                  score,
                  attempts: q.attempts + 1,
                }
              : q
          )
        );
        
        setTakingQuiz(null);
        setCurrentAnswers({});
      } else if (response.status === 401) {
        alert("Session expired. Please log in again.");
      } else {
        alert("Failed to submit quiz");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("Failed to submit quiz");
    }
  };

  if (loading) {
    return <AssignmentsListSkeleton count={3} />;
  }

  if (takingQuiz) {
    const quiz = quizzes.find((q) => q.id === takingQuiz);
    if (!quiz) return null;

    return (
      <div className="space-y-8">
        {/* Quiz Header */}
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ QUIZ IN PROGRESS
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            {quiz.title}
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Week {quiz.week} • {quiz.duration} minutes • Pass Score: {quiz.passingScore}%
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, idx) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A]"
            >
              <h3 className="font-bold text-lg text-[#2A2A28] dark:text-white mb-4">
                Q{idx + 1}. {question.question}
              </h3>

              {(isChoiceQuestion(question.type) ||
                question.type === "TRUE_FALSE" ||
                question.type === "SHORT_ANSWER") && (
                <StudentChoiceInput
                  questionIndex={idx}
                  question={question}
                  value={currentAnswers[idx]}
                  onChange={(next) =>
                    setCurrentAnswers({
                      ...currentAnswers,
                      [idx]: next,
                    })
                  }
                />
              )}

              <div className="mt-3 text-xs font-bold text-[#6B6558] dark:text-slate-400">
                Points: {question.points}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              setTakingQuiz(null);
              setCurrentAnswers({});
            }}
            className="flex-1 rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmitQuiz(quiz.id)}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1630aa] dark:bg-[#60A5FA] dark:text-[#070B19]"
          >
            <FaCheck className="h-4 w-4" />
            Submit Quiz
          </button>
        </div>
      </div>
    );
  }

  // const quizId = takingQuiz;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
          ★ ASSESSMENT ENGINE
        </span>
        <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
          Weekly Quizzes & Assessments
        </h1>
        <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
          Test your knowledge across all 12 modules. Minimum 70% required to pass.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <FaListCheck className="h-16 w-16 text-[#1E3FE0]/30 dark:text-[#60A5FA]/30" />
          <div>
            <h2 className="font-display-custom text-2xl font-bold text-[#2A2A28] dark:text-white">
              No Quizzes Available Yet
            </h2>
            <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-400">
              Quizzes will be available as you enroll in weeks. Start by enrolling in Week 1 to begin!
            </p>
          </div>
          <Link
            href="/dashboard/browse-courses"
            className="inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#12266E]"
          >
            <FaArrowRight className="h-4 w-4" />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => {
            const isUnlocked = enrolledWeeks.includes(quiz.week);

            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex flex-col justify-between rounded-2xl border p-6 shadow-lg transition ${
                  isUnlocked
                    ? "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/10"
                    : "border-black/20 bg-gray-100 dark:border-white/10 dark:bg-white/5 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex rounded-full bg-[#1E3FE0]/10 px-3 py-1 text-[10px] font-extrabold uppercase text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]">
                      Week {quiz.week}
                    </span>
                    <span className="text-[10px] font-bold text-[#6B6558] dark:text-slate-400 flex items-center gap-1">
                      <FaClock className="h-3 w-3" />
                      {quiz.duration} mins
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#2A2A28] dark:text-white">
                    {quiz.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#6B6558] dark:text-slate-400">
                    {quiz.description}
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6558] dark:text-slate-400">
                        {quiz.questions.length} Questions
                      </span>
                      <span className="text-[#6B6558] dark:text-slate-400">Pass: {quiz.passingScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6558] dark:text-slate-400">Attempts: {quiz.attempts}</span>
                      {quiz.status === "COMPLETED" && quiz.score && (
                        <span
                          className={`font-bold ${
                            quiz.score >= quiz.passingScore
                              ? "text-[#10B981]"
                              : "text-[#E8622E]"
                          }`}
                        >
                          Score: {quiz.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-black/10 pt-4 dark:border-white/10">
                  {!isUnlocked ? (
                    <button
                      disabled
                      className="w-full rounded-full bg-gray-300 py-2.5 text-xs font-bold uppercase text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                    >
                      Locked
                    </button>
                  ) : quiz.status === "COMPLETED" ? (
                    <button
                      disabled
                      className="w-full rounded-full bg-[#10B981]/20 py-2.5 text-xs font-bold uppercase text-[#10B981]"
                    >
                      ✓ Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartQuiz(quiz.id)}
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-[#1E3FE0] py-2.5 text-xs font-bold uppercase text-white transition hover:bg-[#1630aa] dark:bg-[#60A5FA] dark:text-[#070B19]"
                    >
                      <FaPlay className="h-3 w-3" />
                      Start Assessment
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

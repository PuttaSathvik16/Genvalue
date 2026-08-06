"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaBookOpen, FaPlay, FaCheck, FaClock, FaLock, FaAward } from "react-icons/fa6";
import { CardGridSkeleton, PortalTitleSkeleton } from "@/components/skeletons";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Week {
  week: number;
  title: string;
  topics: string[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  subtitle: string;
  duration: string;
  level: string;
  status: string;
  weeks: Week[];
}

export default function BrowseCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [enrollingWeek, setEnrollingWeek] = useState<string | null>(null);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [courseProgress, setCourseProgress] = useState(0);
  const [courseCompleted, setCourseCompleted] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        
        if (!authToken) {
          setError("Not authenticated");
          setLoading(false);
          return;
        }

        // Fetch available courses
        const response = await fetch(`${API_URL}/dashboard/available-courses`, {
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCourses(data.data || []);
        } else {
          setError("Failed to load courses");
        }

        // Load completed weeks from localStorage (mock data for now)
        const savedCompleted = localStorage.getItem("completedWeeks");
        if (savedCompleted) {
          const completed = JSON.parse(savedCompleted);
          setCompletedWeeks(completed);
          const progress = Math.round((completed.length / 12) * 100);
          setCourseProgress(progress);
          setCourseCompleted(completed.length === 12);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnrollWeek = async (courseId: string, week: number) => {
    // Check if previous week is completed (except for week 1)
    if (week > 1 && !completedWeeks.includes(week - 1)) {
      alert(`Complete Week ${week - 1} first to unlock Week ${week}`);
      return;
    }

    const weekKey = `${courseId}-week-${week}`;
    setEnrollingWeek(weekKey);
    try {
      const authToken = localStorage.getItem("authToken");
      
      const response = await fetch(`${API_URL}/dashboard/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ courseId, week }),
      });

      if (response.ok) {
        alert(`Successfully enrolled in Week ${week}!`);
        // Simulate week completion for demo
        const newCompleted = [...completedWeeks, week];
        setCompletedWeeks(newCompleted);
        localStorage.setItem("completedWeeks", JSON.stringify(newCompleted));
        
        const progress = Math.round((newCompleted.length / 12) * 100);
        setCourseProgress(progress);
        
        if (newCompleted.length === 12) {
          setCourseCompleted(true);
        }
        
        // Redirect to my learning
        window.location.href = "/dashboard/courses";
      } else {
        alert("Failed to enroll in week");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("Failed to enroll in week");
    } finally {
      setEnrollingWeek(null);
    }
  };

  const isWeekLocked = (week: number) => {
    if (week === 1) return false; // Week 1 always unlocked
    return !completedWeeks.includes(week - 1);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PortalTitleSkeleton />
        <CardGridSkeleton count={3} cols={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
          ★ PROGRAMS
        </span>
        <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
          Browse All Weeks
        </h1>
        <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
          Enroll in individual weeks and earn a certificate for each week completed.
        </p>
      </div>

      {/* Course Progress Bar */}
      {courses.length > 0 && (
        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-[#2A2A28] dark:text-white">AI Tools Mastery Progress</h3>
            <span className="text-sm font-bold text-[#1E3FE0] dark:text-[#60A5FA]">{courseProgress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div 
              className="h-full bg-gradient-to-r from-[#1E3FE0] to-[#E8622E] dark:from-[#60A5FA] dark:to-[#E8622E] transition-all duration-500" 
              style={{ width: `${courseProgress}%` }} 
            />
          </div>
          <p className="mt-2 text-xs font-medium text-[#6B6558] dark:text-slate-400">
            {completedWeeks.length} of 12 weeks completed
          </p>

          {/* Course Completion Banner */}
          {courseCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 dark:from-amber-950/40 dark:to-orange-950/40 dark:border-amber-900/50"
            >
              <div className="flex items-center gap-3">
                <FaAward className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm text-amber-900 dark:text-amber-100">
                    🎉 Course Complete! Final Mastery Certificate Ready
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                    You've completed all 12 weeks! Your final certificate shows {courseProgress}% mastery. 
                    <a href="/dashboard/certificates" className="font-bold underline ml-1">View certificate →</a>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <FaBookOpen className="h-16 w-16 text-[#1E3FE0]/30 dark:text-[#60A5FA]/30" />
          <div>
            <h2 className="font-display-custom text-2xl font-bold text-[#2A2A28] dark:text-white">
              No Courses Available
            </h2>
            <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-400">
              Check back soon for new courses!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {courses.map((course) => (
            <div key={course.id} className="space-y-6">
              {/* Course Info Header */}
              <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="inline-flex rounded-full bg-[#1E3FE0]/10 px-3 py-1 text-[10px] font-extrabold uppercase text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]">
                      {course.duration}
                    </span>
                    <span className="ml-3 inline-flex rounded-full bg-[#E8622E]/10 px-3 py-1 text-[10px] font-extrabold uppercase text-[#E8622E] dark:bg-[#E8622E]/20">
                      {course.level}
                    </span>
                  </div>
                </div>

                <h2 className="font-display-custom text-3xl font-extrabold text-[#2A2A28] dark:text-white">
                  {course.title}
                </h2>
                <p className="mt-2 text-sm font-medium text-[#6B6558] dark:text-slate-300">
                  {course.description}
                </p>
                <p className="mt-1 text-xs font-medium text-[#6B6558] dark:text-slate-400">
                  {course.subtitle}
                </p>
              </div>

              {/* Individual Week Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {course.weeks.map((week) => {
                  const weekKey = `${course.id}-week-${week.week}`;
                  const isEnrolling = enrollingWeek === weekKey;
                  const isLocked = isWeekLocked(week.week);
                  const isCompleted = completedWeeks.includes(week.week);

                  return (
                    <motion.div
                      key={weekKey}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={!isLocked ? { y: -4 } : {}}
                      className={`flex flex-col justify-between rounded-2xl border p-5 shadow-lg transition ${
                        isLocked
                          ? "border-black/20 bg-gray-100 dark:border-white/10 dark:bg-white/5 opacity-60"
                          : "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/10 hover:shadow-xl"
                      }`}
                    >
                      {/* Week Number & Title */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${
                            isCompleted
                              ? "bg-[#10B981] text-white"
                              : isLocked
                              ? "bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                              : "bg-[#1E3FE0] text-white dark:bg-[#60A5FA] dark:text-[#070B19]"
                          }`}>
                            {isCompleted ? <FaCheck className="h-5 w-5" /> : isLocked ? <FaLock className="h-5 w-5" /> : `W${week.week}`}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-[#2A2A28] dark:text-white">
                              Week {week.week}
                            </span>
                            <span className="text-[10px] font-medium text-[#6B6558] dark:text-slate-400 flex items-center gap-1">
                              <FaClock className="h-2.5 w-2.5" />
                              ~7 days
                            </span>
                          </div>
                        </div>

                        <h3 className="font-bold text-sm text-[#2A2A28] dark:text-white line-clamp-2">
                          {week.title}
                        </h3>

                        {/* Lock Status */}
                        {isLocked && (
                          <p className="mt-2 text-xs font-bold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <FaLock className="h-3 w-3" />
                            Complete Week {week.week - 1} first
                          </p>
                        )}

                        {/* Topics List */}
                        {!isLocked && (
                          <ul className="mt-3 space-y-1.5">
                            {week.topics.map((topic, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-[#6B6558] dark:text-slate-400">
                                <FaCheck className="h-3 w-3 text-[#10B981] mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Divider */}
                      {!isLocked && <div className="my-4 border-t border-black/10 dark:border-white/10"></div>}

                      {/* Enroll Button or Status */}
                      {isCompleted ? (
                        <div className="w-full flex items-center justify-center rounded-full bg-[#10B981]/20 py-2.5 text-xs font-bold uppercase tracking-wider text-[#10B981] dark:text-[#10B981]">
                          ✓ Completed
                        </div>
                      ) : isLocked ? (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-300 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                        >
                          <FaLock className="h-3 w-3" />
                          <span>Locked</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnrollWeek(course.id, week.week)}
                          disabled={isEnrolling}
                          className="w-full flex items-center justify-center gap-2 rounded-full bg-[#1E3FE0] py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#1630aa] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]"
                        >
                          <FaPlay className="h-3 w-3" />
                          <span>{isEnrolling ? "Enrolling..." : "Enroll Week"}</span>
                        </button>
                      )}

                      {/* Certificate Badge */}
                      {!isLocked && (
                        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 dark:bg-amber-950/30">
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            📜 Certificate
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

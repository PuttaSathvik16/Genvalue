"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaMagnifyingGlass,
  FaThumbtack,
  FaLock,
  FaEye,
  FaMessage,
  FaThumbsUp,
  FaPlus,
  FaCircleCheck,
} from "react-icons/fa6";
import { DiscussionListSkeleton } from "@/components/skeletons";

interface Discussion {
  id: string;
  title: string;
  slug: string;
  description: string;
  student: {
    id: string;
    name: string;
    profilePicture?: string;
    role: string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
  category: {
    id: string;
    name: string;
    color: string;
  };
  status: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  upvoteCount: number;
  bookmarkCount: number;
  hasOfficialAnswer: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Course {
  id: string;
  title: string;
}

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchDiscussions();
    fetchCategories();
    fetchUserCourses();
  }, [searchQuery, selectedFilter, selectedCategory, selectedCourse, page]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      params.append("filter", selectedFilter);
      if (selectedCategory !== "all") params.append("categoryId", selectedCategory);
      if (selectedCourse !== "all") params.append("courseId", selectedCourse);
      params.append("page", page.toString());
      params.append("limit", "10");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch discussions");

      const data = await response.json();
      setDiscussions(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/categories/list`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch categories`);
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchUserCourses = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/available-courses`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch courses`);
      }

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        setCourses(data.data);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };

  const filters = [
    { key: "all", label: "All Discussions" },
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "most-viewed", label: "Most Viewed" },
    { key: "most-replies", label: "Most Replies" },
    { key: "solved", label: "Solved" },
    { key: "unanswered", label: "Unanswered" },
    { key: "pinned", label: "Pinned" },
  ];

  const getStatusBadge = (status: string, isLocked: boolean) => {
    if (isLocked) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-bold text-red-600 dark:text-red-400">
          <FaLock className="h-3 w-3" />
          Locked
        </span>
      );
    }

    const statusColors: Record<string, string> = {
      OPEN: "bg-[#1E3FE0]/10 text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]",
      SOLVED: "bg-[#10B981]/10 text-[#10B981]",
      CLOSED: "bg-black/5 text-[#6B6558] dark:bg-white/10 dark:text-slate-400",
      REPORTED: "bg-red-500/10 text-red-600 dark:text-red-400",
    };

    return (
      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusColors[status] || "bg-black/5 text-[#6B6558] dark:bg-white/10 dark:text-slate-400"}`}>
        {status}
      </span>
    );
  };

  const inputClass =
    "w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-2.5 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ PEER COLLABORATION
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Discussions
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Ask questions, share knowledge, and collaborate with peers
          </p>
        </div>
        <Link
          href="/dashboard/discussions/create"
          aria-label="Create a new discussion"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#12266E] dark:bg-[#60A5FA] dark:text-[#070B19] dark:hover:bg-[#93C5FD]"
        >
          <FaPlus className="h-4 w-4" />
          Create Discussion
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <FaMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6558] dark:text-slate-400" />
        <input
          type="text"
          placeholder="Search discussions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          aria-label="Search discussions"
          className={`${inputClass} pl-11`}
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
              Filter By
            </label>
            <div className="flex flex-wrap gap-2">
              {filters.slice(0, 4).map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    setSelectedFilter(filter.key);
                    setPage(1);
                  }}
                  aria-label={`Filter by ${filter.label}`}
                  aria-pressed={selectedFilter === filter.key}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    selectedFilter === filter.key
                      ? "bg-[#1E3FE0] text-white dark:bg-[#60A5FA] dark:text-[#070B19]"
                      : "bg-black/5 text-[#2A2A28] hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="category-filter" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
              Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className={inputClass}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="course-filter" className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#6B6558] dark:text-slate-400">
              Course
            </label>
            <select
              id="course-filter"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by course"
              className={inputClass}
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Discussions List */}
      {loading ? (
        <div className="space-y-4">
          <DiscussionListSkeleton count={4} />
        </div>
      ) : discussions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <FaMessage className="h-16 w-16 text-[#1E3FE0]/30 dark:text-[#60A5FA]/30" />
          <div>
            <h2 className="font-display-custom text-xl font-bold text-[#2A2A28] dark:text-white">
              No discussions found
            </h2>
            <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-400">
              Be the first to ask a question or start a conversation!
            </p>
          </div>
          <Link
            href="/dashboard/discussions/create"
            aria-label="Create the first discussion"
            className="inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#12266E] dark:bg-[#60A5FA] dark:text-[#070B19]"
          >
            <FaPlus className="h-4 w-4" />
            Create Discussion
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion, index) => (
            <motion.div
              key={discussion.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/dashboard/discussions/${discussion.id}`}
                aria-label={`View discussion: ${discussion.title}`}
              >
                <div
                  className="cursor-pointer rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg transition hover:shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]"
                  style={{ borderLeftWidth: "4px", borderLeftColor: discussion.category.color }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        {discussion.isPinned && (
                          <FaThumbtack className="h-3.5 w-3.5 text-[#F59E0B]" aria-label="Pinned" />
                        )}
                        {discussion.isLocked && (
                          <FaLock className="h-3.5 w-3.5 text-red-500" aria-label="Locked" />
                        )}
                        <span
                          className="rounded-full px-2 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: discussion.category.color + "20",
                            color: discussion.category.color,
                          }}
                        >
                          {discussion.category.name}
                        </span>
                        {getStatusBadge(discussion.status, discussion.isLocked)}
                      </div>
                      <h3 className="text-lg font-bold text-[#2A2A28] transition hover:text-[#1E3FE0] dark:text-white dark:hover:text-[#60A5FA]">
                        {discussion.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[#6B6558] dark:text-slate-400">
                        {discussion.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-xs text-[#6B6558] dark:text-slate-400">
                        By{" "}
                        <span className="font-bold text-[#2A2A28] dark:text-white">
                          {discussion.student.name}
                        </span>
                      </span>
                      <span className="text-xs text-[#6B6558] dark:text-slate-400">
                        {discussion.course.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#6B6558] dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <FaEye className="h-3.5 w-3.5" />
                        {discussion.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMessage className="h-3.5 w-3.5" />
                        {discussion.replyCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaThumbsUp className="h-3.5 w-3.5" />
                        {discussion.upvoteCount}
                      </span>
                      {discussion.hasOfficialAnswer && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/10 px-2 py-1 text-xs font-bold text-[#10B981]">
                          <FaCircleCheck className="h-3 w-3" />
                          Answered
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-[#6B6558] dark:text-slate-500">
                    {new Date(discussion.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                p === page
                  ? "bg-[#1E3FE0] text-white dark:bg-[#60A5FA] dark:text-[#070B19]"
                  : "border border-black/10 bg-white/60 text-[#2A2A28] hover:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

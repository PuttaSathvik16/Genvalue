"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaNewspaper, FaPlus, FaArrowRight, FaPenToSquare } from "react-icons/fa6";
import { useLmsPortalPath } from "@/hooks/useLmsPortalPath";
import { ensurePortalAuthToken } from "@/lib/portalAuth";
import { fetchMyPosts } from "@/services/blogService";
import { BLOG_STATUS_LABELS, type BlogPost, type BlogPostStatus } from "@/types/blog";
import { formatPostDate } from "@/lib/blog";
import { AssignmentsListSkeleton } from "@/components/skeletons";

function statusBadgeClass(status: BlogPostStatus): string {
  const map: Record<BlogPostStatus, string> = {
    DRAFT: "bg-black/5 text-[#6B6558] dark:bg-white/10 dark:text-slate-400",
    PENDING: "bg-[#F59E0B]/15 text-[#B45309] dark:bg-[#F59E0B]/20 dark:text-[#FCD34D]",
    PUBLISHED: "bg-[#10B981]/10 text-[#10B981]",
    REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400",
  };
  return map[status];
}

export default function StudentDispatchPage() {
  const { toPortal } = useLmsPortalPath();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await ensurePortalAuthToken();
        if (!token) {
          setError("Please sign in to the LMS with Google to manage your dispatches.");
          return;
        }
        const data = await fetchMyPosts(token);
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your posts");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <AssignmentsListSkeleton count={2} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="font-annotation text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ THE GENVALUE DISPATCH
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            My Dispatches
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Share your AI learnings with the community. Submissions are reviewed before publishing.
          </p>
        </div>
        <Link
          href={toPortal("/dashboard/dispatch/create")}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#12266E] dark:bg-[#60A5FA] dark:text-[#070B19] dark:hover:brightness-110"
          aria-label="Write a new dispatch"
        >
          <FaPlus className="h-4 w-4" aria-hidden />
          Write Dispatch
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      ) : null}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <FaNewspaper className="h-16 w-16 text-[#1E3FE0]/30 dark:text-[#60A5FA]/30" aria-hidden />
          <div>
            <h2 className="font-display-custom text-2xl font-bold text-[#2A2A28] dark:text-white">
              No Dispatches Yet
            </h2>
            <p className="mt-2 text-sm text-[#6B6558] dark:text-slate-400">
              Write about a tool you mastered, a workflow you built, or a lesson from your cohort.
            </p>
          </div>
          <Link
            href={toPortal("/dashboard/dispatch/create")}
            className="inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#12266E] dark:bg-[#60A5FA] dark:text-[#070B19]"
            aria-label="Write your first dispatch"
          >
            <FaArrowRight className="h-4 w-4" aria-hidden />
            Write Your First Dispatch
          </Link>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {posts.map((post, index) => {
            const status = post.status ?? "PENDING";
            return (
              <motion.li
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex flex-col justify-between rounded-2xl border border-black/10 bg-white/60 p-6 shadow-lg dark:border-white/10 dark:bg-white/10"
              >
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${statusBadgeClass(status)}`}>
                      {BLOG_STATUS_LABELS[status]}
                    </span>
                    <time dateTime={post.date} className="text-[10px] font-bold text-[#6B6558] dark:text-slate-400">
                      {formatPostDate(post.date)}
                    </time>
                  </div>
                  <h2 className="font-bold text-sm text-[#2A2A28] dark:text-white">{post.title}</h2>
                  <p className="mt-2 line-clamp-3 text-xs text-[#6B6558] dark:text-slate-400">{post.excerpt}</p>
                  {status === "REJECTED" && post.reviewNotes ? (
                    <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400">
                      Admin feedback: {post.reviewNotes}
                    </p>
                  ) : null}
                </div>
                <div className="mt-6 flex flex-wrap gap-2 border-t border-black/10 pt-4 dark:border-white/10">
                  {status === "PUBLISHED" ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-bold uppercase text-[#1E3FE0] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-[#60A5FA]"
                      aria-label={`View published post: ${post.title}`}
                    >
                      View Live
                    </Link>
                  ) : null}
                  {(status === "PENDING" || status === "REJECTED" || status === "DRAFT") && post.id ? (
                    <Link
                      href={toPortal(`/dashboard/dispatch/edit/${post.id}`)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#1E3FE0] py-2.5 text-xs font-bold uppercase text-white transition hover:bg-[#1630aa] dark:bg-[#60A5FA] dark:text-[#070B19]"
                      aria-label={`Edit post: ${post.title}`}
                    >
                      <FaPenToSquare className="h-3 w-3" aria-hidden />
                      Edit
                    </Link>
                  ) : null}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

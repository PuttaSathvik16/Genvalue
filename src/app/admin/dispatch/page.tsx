"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCheck, FaPen, FaXmark } from "react-icons/fa6";
import { AnnouncementsPageSkeleton } from "@/components/skeletons";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { useAdminPortalPath } from "@/hooks/useAdminPortalPath";
import {
  approveBlogPost,
  createAdminBlogPost,
  fetchAdminPosts,
  fetchPendingPosts,
  rejectBlogPost,
} from "@/services/blogService";
import { getAdminAuthToken } from "@/services/adminService";
import { BLOG_STATUS_BADGE, BLOG_STATUS_LABELS, type BlogPost, type BlogPostFormData } from "@/types/blog";
import { formatPostDate } from "@/lib/blog";

type Tab = "pending" | "all" | "write";

export default function AdminDispatchPage() {
  const { toPortal } = useAdminPortalPath();
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState<BlogPost[]>([]);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [actionId, setActionId] = useState<string | null>(null);

  const getToken = () => getAdminAuthToken();

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [pendingData, allData] = await Promise.all([
        fetchPendingPosts(token),
        fetchAdminPosts(token),
      ]);
      setPending(pendingData);
      setAllPosts(allData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setActionId(id);
    try {
      await approveBlogPost(token, id);
      await loadData();
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const token = getToken();
    if (!token) return;
    setActionId(id);
    try {
      await rejectBlogPost(token, id, reviewNotes[id] || "Please revise and resubmit.");
      await loadData();
    } finally {
      setActionId(null);
    }
  };

  const handleAdminCreate = async (data: BlogPostFormData) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    await createAdminBlogPost(token, data);
    setTab("all");
    await loadData();
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "pending", label: "Pending Review", count: pending.length },
    { key: "all", label: "All Posts" },
    { key: "write", label: "Write (Instant Publish)" },
  ];

  if (loading && tab !== "write") {
    return <AnnouncementsPageSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Content</span>
        <h1 className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-white">The Dispatch</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-slate-400">
          Review student submissions and publish team dispatches — admin posts go live immediately.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-label={`Show ${t.label}`}
            aria-pressed={tab === t.key}
            className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
              tab === t.key
                ? "bg-[#2563EB] text-white"
                : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-slate-300"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 ? ` (${t.count})` : ""}
          </button>
        ))}
      </div>

      {tab === "write" ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0D1B2A]">
          <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <FaPen aria-hidden />
            Admin posts publish instantly — no review required.
          </div>
          <BlogPostForm
            submitLabel="Publish to Dispatch"
            onSubmit={handleAdminCreate}
            showFeatured
          />
        </div>
      ) : null}

      {tab === "pending" ? (
        pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 px-8 py-16 text-center dark:border-white/10">
            <FaCheck className="mx-auto h-8 w-8 text-emerald-500" aria-hidden />
            <p className="mt-4 font-semibold text-zinc-800 dark:text-white">No pending submissions</p>
            <p className="mt-1 text-sm text-zinc-500">Student dispatches awaiting review will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-5">
            {pending.map((post) => (
              <motion.li
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0D1B2A]"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="font-bold text-zinc-900 dark:text-white">{post.author}</span>
                  <span>·</span>
                  <span>{post.authorRole}</span>
                  <span>·</span>
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                </div>
                <h2 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">{post.title}</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-slate-400">{post.excerpt}</p>
                {post.content ? (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                      Read full draft
                    </summary>
                    <div className="mt-3 whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:bg-white/5 dark:text-slate-300">
                      {post.content}
                    </div>
                  </details>
                ) : null}
                <textarea
                  value={reviewNotes[post.id ?? ""] ?? ""}
                  onChange={(e) =>
                    setReviewNotes((prev) => ({ ...prev, [post.id ?? ""]: e.target.value }))
                  }
                  placeholder="Optional rejection feedback for the student"
                  rows={2}
                  className="mt-4 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-[#070B19] dark:text-white"
                  aria-label={`Feedback for ${post.title}`}
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={actionId === post.id}
                    onClick={() => post.id && handleApprove(post.id)}
                    aria-label={`Approve ${post.title}`}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <FaCheck aria-hidden />
                    Approve & Publish
                  </button>
                  <button
                    type="button"
                    disabled={actionId === post.id}
                    onClick={() => post.id && handleReject(post.id)}
                    aria-label={`Reject ${post.title}`}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-300"
                  >
                    <FaXmark aria-hidden />
                    Reject
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "all" ? (
        <ul className="space-y-3">
          {allPosts.map((post) => {
            const status = post.status ?? "PENDING";
            return (
              <li
                key={post.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#0D1B2A]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BLOG_STATUS_BADGE[status]}`}>
                      {BLOG_STATUS_LABELS[status]}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">{post.author}</span>
                  </div>
                  <p className="mt-1 font-semibold text-zinc-900 dark:text-white">{post.title}</p>
                </div>
                {status === "PUBLISHED" ? (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-bold text-[#2563EB]"
                    aria-label={`View ${post.title} on The Dispatch`}
                  >
                    View live →
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      <p className="mt-8 text-center text-xs text-zinc-500">
        <Link href={toPortal("/admin/dispatch")} className="text-[#2563EB]">
          Dispatch management
        </Link>
        {" · "}
        Published posts appear on the{" "}
        <Link href="/blog" className="text-[#2563EB]">
          public blog
        </Link>
        {" and "}
        <Link href="/" className="text-[#2563EB]">
          homepage feed
        </Link>
        .
      </p>
    </div>
  );
}

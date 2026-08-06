"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa6";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { useLmsPortalPath } from "@/hooks/useLmsPortalPath";
import { ensurePortalAuthToken } from "@/lib/portalAuth";
import { fetchMyPosts, updateBlogPost } from "@/services/blogService";
import type { BlogPost, BlogPostFormData } from "@/types/blog";
import { AssignmentsListSkeleton } from "@/components/skeletons";

export default function EditDispatchPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toPortal } = useLmsPortalPath();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await ensurePortalAuthToken();
        if (!token) throw new Error("Please sign in to the LMS with Google");
        const posts = await fetchMyPosts(token);
        const match = posts.find((p) => p.id === id);
        if (!match) throw new Error("Post not found");
        setPost(match);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (data: BlogPostFormData) => {
    const token = await ensurePortalAuthToken();
    if (!token || !post?.id) throw new Error("Please sign in to the LMS with Google");
    await updateBlogPost(token, post.id, data);
    router.push(toPortal("/dashboard/dispatch"));
  };

  if (loading) {
    return <AssignmentsListSkeleton count={1} />;
  }

  if (error || !post) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600 dark:text-red-400" role="alert">
          {error ?? "Post not found"}
        </div>
        <Link
          href={toPortal("/dashboard/dispatch")}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1E3FE0] dark:text-[#60A5FA]"
        >
          <FaArrowLeft className="h-4 w-4" aria-hidden />
          Back to My Dispatches
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link
          href={toPortal("/dashboard/dispatch")}
          aria-label="Back to my dispatches"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#1E3FE0] transition hover:text-[#12266E] dark:text-[#60A5FA] dark:hover:text-[#93C5FD]"
        >
          <FaArrowLeft className="h-4 w-4" aria-hidden />
          Back to My Dispatches
        </Link>
        <div className="space-y-1">
          <span className="font-annotation block text-xs font-bold uppercase tracking-widest text-[#E8622E]">
            ★ EDIT DISPATCH
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Edit Dispatch
          </h1>
          {post.status === "REJECTED" && post.reviewNotes ? (
            <p className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400">
              Admin feedback: {post.reviewNotes}
            </p>
          ) : null}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-8 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <BlogPostForm
          initial={{
            title: post.title,
            excerpt: post.excerpt,
            content: post.content ?? "",
            category: post.category,
            tags: post.tags,
            coverImage: post.coverImage,
          }}
          submitLabel={post.status === "REJECTED" ? "Resubmit for Review" : "Save Changes"}
          onSubmit={handleSubmit}
          variant="portal"
        />
      </motion.div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa6";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { useLmsPortalPath } from "@/hooks/useLmsPortalPath";
import { ensurePortalAuthToken } from "@/lib/portalAuth";
import { createBlogPost } from "@/services/blogService";
import type { BlogPostFormData } from "@/types/blog";

export default function CreateDispatchPage() {
  const router = useRouter();
  const { toPortal } = useLmsPortalPath();

  const handleSubmit = async (data: BlogPostFormData) => {
    const token = await ensurePortalAuthToken();
    if (!token) throw new Error("Please sign in to the LMS with Google to submit a dispatch");
    await createBlogPost(token, data);
    router.push(toPortal("/dashboard/dispatch"));
  };

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
            ★ NEW DISPATCH
          </span>
          <h1 className="font-display-custom text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            Write a Dispatch
          </h1>
          <p className="text-xs font-medium text-[#6B6558] dark:text-slate-400">
            Your post goes to the admin review queue. Once approved, it appears on The GenValue Dispatch with your name.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-8 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <BlogPostForm submitLabel="Submit for Review" onSubmit={handleSubmit} variant="portal" />
      </motion.div>
    </div>
  );
}

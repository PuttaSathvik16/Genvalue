"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaThumbsUp,
  FaBookmark,
  FaFlag,
  FaLock,
  FaThumbtack,
  FaCircleCheck,
  FaPaperPlane,
} from "react-icons/fa6";
import { DetailPageSkeleton } from "@/components/skeletons";

interface Reply {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    profilePicture?: string;
    role: string;
  };
  isOfficialAnswer: boolean;
  upvoteCount: number;
  helpfulCount: number;
  createdAt: string;
  upvotedByUser?: boolean;
  childReplies?: Reply[];
}

interface DiscussionTag {
  tag: {
    id: string;
    name: string;
  };
}

interface Discussion {
  id: string;
  title: string;
  description: string;
  student: {
    id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
    role: string;
  };
  course: {
    id: string;
    title: string;
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
  isUpvotedByUser: boolean;
  isBookmarkedByUser: boolean;
  tags: DiscussionTag[];
  replies: Reply[];
  createdAt: string;
  officialReplyId?: string;
}

export default function DiscussionDetailPage() {
  const params = useParams();
  const discussionId = params.id as string;

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDiscussion();
  }, [discussionId]);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/${discussionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch discussion");

      const data = await response.json();
      setDiscussion(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load discussion");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      setError("Reply content cannot be empty");
      return;
    }

    try {
      setSubmittingReply(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/${discussionId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ content: replyContent }),
        }
      );

      if (!response.ok) throw new Error("Failed to submit reply");

      setReplyContent("");
      fetchDiscussion();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleUpvoteDiscussion = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/${discussionId}/upvote`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchDiscussion();
      }
    } catch (err) {
      console.error("Error upvoting:", err);
    }
  };

  const handleBookmark = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/${discussionId}/bookmark`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchDiscussion();
      }
    } catch (err) {
      console.error("Error bookmarking:", err);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-[#60A5FA]";

  if (loading) {
    return <DetailPageSkeleton />;
  }

  if (!discussion) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/discussions"
          aria-label="Back to discussions"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1E3FE0] dark:text-[#60A5FA]"
        >
          <FaArrowLeft className="h-4 w-4" />
          Back to Discussions
        </Link>
        <div className="rounded-3xl border border-dashed border-black/20 bg-[#F6F1E4]/50 p-12 text-center dark:border-white/20 dark:bg-[#0D1B2A]/50">
          <p className="text-lg font-bold text-[#6B6558] dark:text-slate-400">Discussion not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/discussions"
        aria-label="Back to discussions"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#1E3FE0] transition hover:text-[#12266E] dark:text-[#60A5FA] dark:hover:text-[#93C5FD]"
      >
        <FaArrowLeft className="h-4 w-4" />
        Back to Discussions
      </Link>

      {/* Discussion */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-8 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <div className="mb-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {discussion.isPinned && (
              <FaThumbtack className="h-4 w-4 text-[#F59E0B]" aria-label="Pinned" />
            )}
            {discussion.isLocked && (
              <FaLock className="h-4 w-4 text-red-500" aria-label="Locked" />
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
            <span className="rounded-full bg-[#1E3FE0]/10 px-2 py-1 text-xs font-bold text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]">
              {discussion.status}
            </span>
          </div>

          <h1 className="font-display-custom mb-4 text-2xl font-extrabold tracking-tight text-[#2A2A28] dark:text-white sm:text-3xl">
            {discussion.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-6 dark:border-white/10">
            <div className="flex items-center gap-4">
              {discussion.student.profilePicture && (
                <Image
                  src={discussion.student.profilePicture}
                  alt={discussion.student.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-bold text-[#2A2A28] dark:text-white">{discussion.student.name}</p>
                <p className="text-xs text-[#6B6558] dark:text-slate-400">
                  Asked {new Date(discussion.createdAt).toLocaleDateString()} in{" "}
                  {discussion.course.title}
                </p>
              </div>
            </div>
            <span className="text-sm text-[#6B6558] dark:text-slate-400">
              {discussion.viewCount} views
            </span>
          </div>
        </div>

        <div className="mb-6 whitespace-pre-wrap text-[#2A2A28] dark:text-slate-300">
          {discussion.description}
        </div>

        {discussion.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {discussion.tags.map((t) => (
              <span
                key={t.tag.id}
                className="rounded-full bg-black/5 px-3 py-1 text-sm font-medium text-[#6B6558] dark:bg-white/10 dark:text-slate-400"
              >
                {t.tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-t border-black/10 pt-6 dark:border-white/10">
          <button
            onClick={handleUpvoteDiscussion}
            aria-label="Upvote discussion"
            aria-pressed={discussion.isUpvotedByUser}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              discussion.isUpvotedByUser
                ? "bg-[#1E3FE0]/10 text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]"
                : "text-[#6B6558] hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/10"
            }`}
          >
            <FaThumbsUp className="h-4 w-4" />
            {discussion.upvoteCount}
          </button>

          <button
            onClick={handleBookmark}
            aria-label="Bookmark discussion"
            aria-pressed={discussion.isBookmarkedByUser}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
              discussion.isBookmarkedByUser
                ? "bg-[#F59E0B]/10 text-[#F59E0B]"
                : "text-[#6B6558] hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/10"
            }`}
          >
            <FaBookmark className="h-4 w-4" />
          </button>

          <button
            aria-label="Report discussion"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-[#6B6558] transition hover:bg-black/5 dark:text-slate-400 dark:hover:bg-white/10"
          >
            <FaFlag className="h-4 w-4" />
            Report
          </button>
        </div>
      </motion.div>

      {/* Replies */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-8 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
      >
        <h2 className="font-display-custom mb-6 text-xl font-extrabold text-[#2A2A28] dark:text-white">
          {discussion.replyCount} {discussion.replyCount === 1 ? "Reply" : "Replies"}
        </h2>

        {discussion.replies.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[#6B6558] dark:text-slate-400">No replies yet. Be the first to answer!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {discussion.replies.map((reply) => (
              <div key={reply.id} className="border-b border-black/10 pb-6 last:border-0 dark:border-white/10">
                {reply.isOfficialAnswer && (
                  <div className="mb-3 flex w-fit items-center gap-2 rounded-full bg-[#10B981]/10 px-3 py-2 text-[#10B981]">
                    <FaCircleCheck className="h-4 w-4" />
                    <span className="text-sm font-bold">Official Answer</span>
                  </div>
                )}

                <div className="mb-3 flex items-center gap-3">
                  {reply.author.profilePicture && (
                    <Image
                      src={reply.author.profilePicture}
                      alt={reply.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-bold text-[#2A2A28] dark:text-white">
                      {reply.author.name}
                      {reply.author.role !== "STUDENT" && (
                        <span className="ml-2 rounded-full bg-[#1E3FE0]/10 px-2 py-1 text-xs font-bold text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]">
                          {reply.author.role}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[#6B6558] dark:text-slate-400">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mb-3 whitespace-pre-wrap text-[#2A2A28] dark:text-slate-300">
                  {reply.content}
                </div>

                <button
                  aria-label="Upvote reply"
                  className="flex items-center gap-1 text-sm text-[#6B6558] transition hover:text-[#1E3FE0] dark:text-slate-400 dark:hover:text-[#60A5FA]"
                >
                  <FaThumbsUp className="h-3.5 w-3.5" />
                  {reply.upvoteCount}
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Reply Form */}
      {!discussion.isLocked && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-8 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
        >
          <h3 className="mb-4 text-lg font-bold text-[#2A2A28] dark:text-white">Your Reply</h3>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitReply}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts, answer, or insight..."
              rows={6}
              aria-label="Reply content"
              className={`${inputClass} mb-4`}
            />

            <button
              type="submit"
              disabled={submittingReply}
              aria-label="Submit reply"
              className="inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#12266E] disabled:opacity-50 dark:bg-[#60A5FA] dark:text-[#070B19]"
            >
              <FaPaperPlane className="h-4 w-4" />
              {submittingReply ? "Submitting..." : "Submit Reply"}
            </button>
          </form>
        </motion.div>
      )}

      {discussion.isLocked && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <FaLock className="mx-auto mb-2 h-6 w-6 text-red-600 dark:text-red-400" />
          <p className="font-bold text-red-700 dark:text-red-400">This discussion is locked</p>
          <p className="text-sm text-red-600 dark:text-red-400">No new replies can be added at this time</p>
        </div>
      )}
    </div>
  );
}

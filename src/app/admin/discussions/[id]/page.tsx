"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pin,
  Lock,
  Trash2,
  CheckCircle,
  Eye,
  MessageCircle,
  AlertCircle,
  Edit,
  MoreVertical,
} from "lucide-react";
import { AdminDetailPanelSkeleton } from "@/components/skeletons";

interface Discussion {
  id: string;
  title: string;
  description: string;
  student: {
    id: string;
    name: string;
    profilePicture?: string;
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
  createdAt: string;
  replies: any[];
}

export default function DiscussionManagementPage() {
  const params = useParams();
  const router = useRouter();
  const discussionId = params.id as string;

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchDiscussion();
    getUserRole();
  }, [discussionId]);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/${discussionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch discussion");

      const data = await response.json();
      setDiscussion(data.data);
    } catch (error) {
      console.error("Error fetching discussion:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserRole(data.data.role);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const handleTogglePin = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/${discussionId}/pin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchDiscussion();
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleLock = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/${discussionId}/lock`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        fetchDiscussion();
      }
    } catch (error) {
      console.error("Error toggling lock:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/${discussionId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        fetchDiscussion();
        setShowStatusMenu(false);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this discussion?")) return;

    try {
      setActionLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${discussionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        router.push("/admin/discussions");
      }
    } catch (error) {
      console.error("Error deleting discussion:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <AdminDetailPanelSkeleton />;
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin/discussions" className="flex items-center gap-2 text-blue-600 mb-6">
            <ArrowLeft size={20} />
            Back to Discussions
          </Link>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-slate-600 text-lg">Discussion not found</p>
          </div>
        </div>
      </div>
    );
  }

  const statusOptions = ["OPEN", "SOLVED", "CLOSED", "LOCKED", "ARCHIVED", "REPORTED"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Link href="/admin/discussions" className="flex items-center gap-2 text-blue-600 mb-6">
          <ArrowLeft size={20} />
          Back to Discussions
        </Link>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Discussion Details - Main Column */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              {/* Title and Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {discussion.isPinned && <Pin size={18} className="text-yellow-500" />}
                  {discussion.isLocked && <Lock size={18} className="text-red-500" />}
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded"
                    style={{
                      backgroundColor: discussion.category.color + "20",
                      color: discussion.category.color,
                    }}
                  >
                    {discussion.category.name}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-4">{discussion.title}</h1>

                <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    {discussion.student.profilePicture && (
                      <img
                        src={discussion.student.profilePicture}
                        alt={discussion.student.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{discussion.student.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(discussion.createdAt).toLocaleDateString()} in{" "}
                        {discussion.course.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      {discussion.viewCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle size={16} />
                      {discussion.replyCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none">
                <div className="text-slate-700 whitespace-pre-wrap">{discussion.description}</div>
              </div>
            </div>

            {/* Replies */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Replies ({discussion.replies.length})
              </h2>

              {discussion.replies.length === 0 ? (
                <div className="text-center py-8 text-slate-600">No replies yet</div>
              ) : (
                <div className="space-y-6">
                  {discussion.replies.map((reply) => (
                    <div key={reply.id} className="border-b border-slate-200 pb-6 last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {reply.author.profilePicture && (
                            <img
                              src={reply.author.profilePicture}
                              alt={reply.author.name}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">
                              {reply.author.name}
                              {reply.author.role !== "STUDENT" && (
                                <span className="text-xs font-semibold ml-2 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {reply.author.role}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {reply.isOfficialAnswer && (
                          <CheckCircle className="text-green-500" size={20} />
                        )}
                      </div>

                      <div className="text-slate-700 whitespace-pre-wrap mb-3">
                        {reply.content}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>{reply.upvoteCount} upvotes</span>
                        <span>•</span>
                        <span>{reply.helpfulCount} helpful</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions</h3>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-left bg-white hover:bg-slate-50 transition"
                  >
                    <span className="font-semibold text-slate-900">{discussion.status}</span>
                  </button>

                  {showStatusMenu && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateStatus(status)}
                          disabled={actionLoading}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-100 transition ${
                            status === discussion.status ? "bg-blue-50 text-blue-700" : ""
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pin Button */}
              <button
                onClick={handleTogglePin}
                disabled={actionLoading}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg mb-3 transition ${
                  discussion.isPinned
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Pin size={18} />
                {discussion.isPinned ? "Unpin" : "Pin"}
              </button>

              {/* Lock Button */}
              <button
                onClick={handleToggleLock}
                disabled={actionLoading}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg mb-3 transition ${
                  discussion.isLocked
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Lock size={18} />
                {discussion.isLocked ? "Unlock" : "Lock"}
              </button>

              {/* Delete Button (Admin Only) */}
              {userRole === "ADMIN" && (
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              )}

              {/* Divider */}
              <div className="my-4 border-t border-slate-200"></div>

              {/* Info */}
              <div className="text-sm text-slate-600 space-y-2">
                <div>
                  <span className="font-semibold">Course:</span>
                  <p>{discussion.course.title}</p>
                </div>
                <div>
                  <span className="font-semibold">Student:</span>
                  <p>{discussion.student.name}</p>
                </div>
                <div>
                  <span className="font-semibold">Views:</span>
                  <p>{discussion.viewCount}</p>
                </div>
                <div>
                  <span className="font-semibold">Replies:</span>
                  <p>{discussion.replyCount}</p>
                </div>
                <div>
                  <span className="font-semibold">Upvotes:</span>
                  <p>{discussion.upvoteCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

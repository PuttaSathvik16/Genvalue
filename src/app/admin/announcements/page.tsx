"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FaBell,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaXmark,
  FaClock,
} from "react-icons/fa6";
import { AnnouncementsPageSkeleton } from "@/components/skeletons";
import {
  ANNOUNCEMENT_AUDIENCE_LABELS,
  ANNOUNCEMENT_TARGET_AUDIENCES,
  formatAnnouncementAudience,
  getAnnouncementAudienceBadgeClass,
  type AnnouncementTargetAudience,
} from "@/lib/announcements";
import { getAdminAuthToken } from "@/services/adminService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

interface Announcement {
  id: string;
  title: string;
  message: string;
  description?: string;
  type: string;
  priority: string;
  status: string;
  targetAudience: AnnouncementTargetAudience;
  publishedAt: string;
  expiresAt?: string;
  imageUrl?: string;
  createdBy: { name: string; email: string };
  _count: { notifications: number };
}

type FormType = "create" | "edit" | null;

export default function AnnouncementsPage() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState<FormType>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    description: "",
    type: "GENERAL",
    priority: "NORMAL",
    targetAudience: "ALL" as AnnouncementTargetAudience,
    expiresAt: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const authToken = getAdminAuthToken();
      if (!authToken) {
        router.push("/admin/auth/login");
        return;
      }

      const response = await fetch(`${API_URL}/announcements/admin/list`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.data);
      } else if (response.status === 401) {
        router.push("/admin/auth/login");
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const authToken = getAdminAuthToken();
      if (!authToken) {
        router.push("/admin/auth/login");
        return;
      }

      const response = await fetch(`${API_URL}/announcements`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormOpen(null);
        setFormData({
          title: "",
          message: "",
          description: "",
          type: "GENERAL",
          priority: "NORMAL",
          targetAudience: "ALL",
          expiresAt: "",
        });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error("Failed to create announcement:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      const authToken = getAdminAuthToken();
      if (!authToken) {
        router.push("/admin/auth/login");
        return;
      }

      const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` },
      });

      if (response.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
      case "HIGH":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200";
      case "NORMAL":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
    return <AnnouncementsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display-custom text-3xl font-extrabold text-[#2A2A28] dark:text-white">
            Announcements
          </h1>
          <p className="mt-1 text-sm text-[#6B6558] dark:text-slate-400">
            {announcements.length} announcement{announcements.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: "",
              message: "",
              description: "",
              type: "GENERAL",
              priority: "NORMAL",
              targetAudience: "ALL",
              expiresAt: "",
            });
            setFormOpen("create");
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#1E3FE0] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1530b5] dark:bg-[#60A5FA] dark:text-[#070B19]"
        >
          <FaPlus className="h-4 w-4" />
          Create Announcement
        </button>
      </div>

      {/* Create Form Modal */}
      {formOpen === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl bg-white p-8 dark:bg-[#0D1B2A]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display-custom text-2xl font-bold text-[#2A2A28] dark:text-white">
                Create Announcement
              </h2>
              <button
                onClick={() => setFormOpen(null)}
                className="text-[#6B6558] hover:text-[#2A2A28] dark:text-slate-400 dark:hover:text-white"
              >
                <FaXmark className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#2A2A28] dark:text-white mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2A2A28] placeholder:text-[#6B6558]/60 outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-[#60A5FA]"
                  placeholder="Announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2A2A28] dark:text-white mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2A2A28] placeholder:text-[#6B6558]/60 outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-[#60A5FA]"
                  placeholder="Full announcement message"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2A2A28] dark:text-white mb-2">
                  Description (for preview)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2A2A28] placeholder:text-[#6B6558]/60 outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-[#60A5FA]"
                  placeholder="Short preview text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#2A2A28] dark:text-white mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-[#60A5FA]"
                  >
                    <option value="GENERAL">General</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="SYSTEM">System</option>
                    <option value="DEADLINE">Deadline</option>
                    <option value="EVENT">Event</option>
                    <option value="MENTORSHIP">Mentorship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2A2A28] dark:text-white mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-[#60A5FA]"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2A2A28] dark:text-white mb-2">
                  Applicable To *
                </label>
                <select
                  required
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetAudience: e.target.value as AnnouncementTargetAudience,
                    })
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-[#60A5FA]"
                  aria-label="Select who this announcement applies to"
                >
                  {ANNOUNCEMENT_TARGET_AUDIENCES.map((audience) => (
                    <option key={audience} value={audience}>
                      {ANNOUNCEMENT_AUDIENCE_LABELS[audience]}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-[#6B6558] dark:text-slate-400">
                  Only users in the selected role(s) will see this announcement in their portal.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#2A2A28] dark:text-white mb-2">
                  Expires At (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-[#2A2A28] outline-none transition focus:border-[#1E3FE0] dark:border-white/10 dark:bg-white/10 dark:text-white dark:focus:border-[#60A5FA]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#1E3FE0] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1530b5] dark:bg-[#60A5FA] dark:text-[#070B19]"
                >
                  <FaCheck className="mr-2 inline h-4 w-4" />
                  Publish Announcement
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(null)}
                  className="flex-1 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Announcements List */}
      {announcements.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-12 text-center dark:border-white/10 dark:bg-[#0D1B2A]">
          <FaBell className="mx-auto h-12 w-12 text-[#6B6558] dark:text-slate-400" />
          <p className="mt-4 text-sm font-medium text-[#6B6558] dark:text-slate-400">
            No announcements yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-display-custom text-lg font-bold text-[#2A2A28] dark:text-white">
                      {announcement.title}
                    </h3>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${getAnnouncementAudienceBadgeClass(announcement.targetAudience ?? "ALL")}`}
                    >
                      {formatAnnouncementAudience(announcement.targetAudience)}
                    </span>
                  </div>

                  <p className="text-sm text-[#6B6558] dark:text-slate-300 line-clamp-2">
                    {announcement.message}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-[#6B6558] dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <FaClock className="h-3 w-3" />
                      {new Date(announcement.publishedAt).toLocaleDateString()}
                    </div>
                    <div>
                      {announcement._count.notifications} recipient
                      {announcement._count.notifications !== 1 ? "s" : ""} notified
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="rounded-xl border border-red-300 bg-red-50 p-2.5 text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                  >
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

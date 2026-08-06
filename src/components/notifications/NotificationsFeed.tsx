"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaCheck,
  FaCircleExclamation,
  FaCircleInfo,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";
import { ListItemsSkeleton, PortalTitleSkeleton } from "@/components/skeletons";
import { API_URL } from "@/lib/api";
import { ANNOUNCEMENT_SENDER_NAME } from "@/lib/announcements";
import { ensurePortalAuthToken } from "@/lib/portalAuth";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionLabel?: string;
  announcement?: {
    id: string;
    imageUrl?: string;
    priority: string;
    message?: string;
    createdBy: { name: string };
  };
}

interface NotificationsFeedProps {
  /** Resolve stored action paths (e.g. obfuscated LMS portal URLs). */
  resolveActionUrl?: (url: string) => string;
}

export function NotificationsFeed({ resolveActionUrl }: NotificationsFeedProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const resolveUrl = useCallback(
    (url: string) => (resolveActionUrl ? resolveActionUrl(url) : url),
    [resolveActionUrl]
  );

  const getAuthHeaders = useCallback(async () => {
    const authToken = await ensurePortalAuthToken();
    if (!authToken) return null;
    return { Authorization: `Bearer ${authToken}` };
  }, []);

  const fetchNotifications = useCallback(async () => {
    setFetchError(null);

    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filter === "unread") params.set("isRead", "false");

      const response = await fetch(`${API_URL}/notifications?${params.toString()}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
        return;
      }

      if (response.status === 401) {
        const retryHeaders = await getAuthHeaders();
        if (!retryHeaders) return;

        const retry = await fetch(`${API_URL}/notifications?${params.toString()}`, {
          headers: retryHeaders,
        });

        if (retry.ok) {
          const data = await retry.json();
          setNotifications(data.data);
          setUnreadCount(data.unreadCount);
          return;
        }
      }

      setFetchError("Could not load notifications. Please try again.");
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setFetchError("Could not load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filter, getAuthHeaders]);

  useEffect(() => {
    setLoading(true);
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!selectedNotification) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedNotification(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedNotification]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers,
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
        setSelectedNotification((prev) =>
          prev?.id === id ? { ...prev, isRead: true } : prev
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        setSelectedNotification((prev) => (prev?.id === id ? null : prev));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const headers = await getAuthHeaders();
      if (!headers) return;

      const response = await fetch(`${API_URL}/notifications/read/all`, {
        method: "PUT",
        headers,
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const openNotification = async (notif: Notification) => {
    setSelectedNotification(notif);
    if (!notif.isRead) {
      await handleMarkAsRead(notif.id);
    }
  };

  const handleGoToAction = (notif: Notification) => {
    if (!notif.actionUrl) return;
    setSelectedNotification(null);
    router.push(resolveUrl(notif.actionUrl));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return <FaBell className="h-5 w-5 text-[#1E3FE0]" />;
      case "DEADLINE":
        return <FaCircleExclamation className="h-5 w-5 text-[#E8622E]" />;
      case "GRADE":
        return <FaCheck className="h-5 w-5 text-[#10B981]" />;
      default:
        return <FaCircleInfo className="h-5 w-5 text-[#6B6558]" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-800";
      case "HIGH":
        return "bg-orange-100 border-orange-300 dark:bg-orange-950 dark:border-orange-800";
      case "NORMAL":
        return "bg-blue-100 border-blue-300 dark:bg-blue-950 dark:border-blue-800";
      default:
        return "bg-gray-100 border-gray-300 dark:bg-gray-900 dark:border-gray-700";
    }
  };

  const getDisplayMessage = (notif: Notification) =>
    notif.announcement?.message || notif.message;

  if (loading) {
    return (
      <div className="space-y-6">
        <PortalTitleSkeleton hasAction />
        <ListItemsSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display-custom text-3xl font-extrabold text-[#2A2A28] dark:text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-[#6B6558] dark:text-slate-400">
              You have <strong>{unreadCount}</strong> unread notification
              {unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="rounded-full bg-[#1E3FE0] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1530b5] dark:bg-[#60A5FA] dark:text-[#070B19]"
            aria-label="Mark all notifications as read"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {fetchError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {fetchError}
        </div>
      )}

      <div className="flex gap-3 border-b border-black/10 dark:border-white/10">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
            filter === "all"
              ? "border-[#1E3FE0] text-[#1E3FE0] dark:border-[#60A5FA] dark:text-[#60A5FA]"
              : "border-transparent text-[#6B6558] hover:text-[#2A2A28] dark:text-slate-400 dark:hover:text-white"
          }`}
          aria-label="Show all notifications"
        >
          All Notifications
        </button>
        <button
          type="button"
          onClick={() => setFilter("unread")}
          className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
            filter === "unread"
              ? "border-[#E8622E] text-[#E8622E]"
              : "border-transparent text-[#6B6558] hover:text-[#2A2A28] dark:text-slate-400 dark:hover:text-white"
          }`}
          aria-label="Show unread notifications only"
        >
          Unread
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E8622E] text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-12 text-center dark:border-white/10 dark:bg-[#0D1B2A]">
          <FaBell className="mx-auto h-12 w-12 text-[#6B6558] dark:text-slate-400" />
          <p className="mt-4 text-sm font-medium text-[#6B6558] dark:text-slate-400">
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications yet. New announcements will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              role="button"
              tabIndex={0}
              onClick={() => openNotification(notif)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openNotification(notif);
                }
              }}
              className={`cursor-pointer rounded-2xl border-2 p-4 text-left transition hover:shadow-md ${
                notif.isRead
                  ? "border-black/5 bg-white/30 dark:border-white/5 dark:bg-white/5"
                  : `border-2 ${getPriorityColor(notif.announcement?.priority)} dark:bg-opacity-20`
              }`}
              aria-label={`Open notification: ${notif.title}`}
            >
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">{getNotificationIcon(notif.type)}</div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display-custom text-sm font-bold text-[#2A2A28] dark:text-white">
                        {notif.title}
                      </h3>
                      {notif.type === "ANNOUNCEMENT" && (
                        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1E3FE0] dark:text-[#60A5FA]">
                          Announcement
                        </p>
                      )}
                      {notif.type === "ANNOUNCEMENT" && (
                        <p className="mt-0.5 text-xs text-[#6B6558] dark:text-slate-400">
                          from {ANNOUNCEMENT_SENDER_NAME}
                        </p>
                      )}
                    </div>

                    {!notif.isRead && (
                      <span
                        className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[#1E3FE0]"
                        aria-hidden
                      />
                    )}
                  </div>

                  <p className="mt-2 line-clamp-3 text-sm text-[#6B6558] dark:text-slate-300">
                    {getDisplayMessage(notif)}
                  </p>

                  {notif.announcement?.imageUrl && (
                    <img
                      src={notif.announcement.imageUrl}
                      alt=""
                      className="mt-3 h-24 w-full rounded-xl object-cover"
                    />
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-[#6B6558] dark:text-slate-500">
                      {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <div className="flex gap-2">
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notif.id);
                          }}
                          className="text-xs font-bold text-[#6B6558] hover:text-[#2A2A28] dark:text-slate-400 dark:hover:text-white"
                          aria-label={`Mark ${notif.title} as read`}
                        >
                          Mark Read
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notif.id);
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        aria-label={`Delete notification: ${notif.title}`}
                      >
                        <FaTrash className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedNotification && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={() => setSelectedNotification(null)}
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="notification-popup-title"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div>
                    {selectedNotification.type === "ANNOUNCEMENT" && (
                      <span className="font-annotation text-[10px] font-bold uppercase tracking-wider text-[#1E3FE0] dark:text-[#60A5FA]">
                        Announcement
                      </span>
                    )}
                    <h2
                      id="notification-popup-title"
                      className="font-display-custom text-xl font-bold text-[#2A2A28] dark:text-white"
                    >
                      {selectedNotification.title}
                    </h2>
                    {selectedNotification.type === "ANNOUNCEMENT" && (
                      <p className="mt-1 text-sm text-[#6B6558] dark:text-slate-400">
                        from {ANNOUNCEMENT_SENDER_NAME}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-lg p-2 text-[#6B6558] transition hover:bg-black/5 hover:text-[#2A2A28] dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Close notification"
                >
                  <FaXmark className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-[#2A2A28] dark:text-slate-200">
                {getDisplayMessage(selectedNotification)}
              </p>

              {selectedNotification.announcement?.imageUrl && (
                <img
                  src={selectedNotification.announcement.imageUrl}
                  alt=""
                  className="mt-4 max-h-48 w-full rounded-xl object-cover"
                />
              )}

              <p className="mt-4 text-xs text-[#6B6558] dark:text-slate-500">
                {new Date(selectedNotification.createdAt).toLocaleDateString()} at{" "}
                {new Date(selectedNotification.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {selectedNotification.actionUrl && (
                  <button
                    type="button"
                    onClick={() => handleGoToAction(selectedNotification)}
                    className="rounded-xl bg-[#1E3FE0] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1530b5] dark:bg-[#60A5FA] dark:text-[#070B19]"
                    aria-label="Go to related page"
                  >
                    {selectedNotification.actionLabel || "Go to Dashboard"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold text-[#2A2A28] transition hover:bg-black/5 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  aria-label="Close notification popup"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedNotification.id)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
                  aria-label={`Delete notification: ${selectedNotification.title}`}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

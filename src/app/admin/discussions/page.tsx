"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Pin,
  Lock,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import { TableRowsSkeleton } from "@/components/skeletons";
import { getAdminAuthToken } from "@/services/adminService";

interface DashboardStats {
  totalDiscussions: number;
  openDiscussions: number;
  solvedDiscussions: number;
  pendingReports: number;
  pinnedDiscussions: number;
  lockedDiscussions: number;
  archivedDiscussions: number;
}

interface Discussion {
  id: string;
  title: string;
  status: string;
  student: {
    name: string;
  };
  course: {
    title: string;
  };
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
}

export default function DiscussionDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    fetchData();
    getUserRole();
  }, [searchQuery, statusFilter, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const authToken = getAdminAuthToken();
      if (!authToken) return;

      // Fetch stats
      const statsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      // Fetch discussions
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("page", page.toString());
      params.append("limit", "20");

      const discussionsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discussions?${params}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (discussionsRes.ok) {
        const discussionsData = await discussionsRes.json();
        setDiscussions(discussionsData.data);
        setTotalPages(discussionsData.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = async () => {
    try {
      const authToken = getAdminAuthToken();
      if (!authToken) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
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

  const statCards = [
    {
      title: "Total Discussions",
      value: stats?.totalDiscussions || 0,
      icon: MessageSquare,
      color: "bg-blue-50 text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Open",
      value: stats?.openDiscussions || 0,
      icon: AlertCircle,
      color: "bg-yellow-50 text-yellow-600",
      borderColor: "border-yellow-200",
    },
    {
      title: "Solved",
      value: stats?.solvedDiscussions || 0,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Pending Reports",
      value: stats?.pendingReports || 0,
      icon: AlertCircle,
      color: "bg-red-50 text-red-600",
      borderColor: "border-red-200",
    },
    {
      title: "Pinned",
      value: stats?.pinnedDiscussions || 0,
      icon: Pin,
      color: "bg-purple-50 text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "Locked",
      value: stats?.lockedDiscussions || 0,
      icon: Lock,
      color: "bg-slate-50 text-slate-600",
      borderColor: "border-slate-200",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: "bg-blue-100 text-blue-800",
      SOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
      LOCKED: "bg-red-100 text-red-800",
      REPORTED: "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Discussion Management</h1>
          <p className="text-slate-600 mt-2">Manage and moderate course discussions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`${card.color} border ${card.borderColor} rounded-lg p-6 backdrop-blur-sm`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">{card.title}</p>
                    <p className="text-3xl font-bold mt-2">{card.value}</p>
                  </div>
                  <Icon size={24} className="opacity-50" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Discussions</h2>
            {userRole === "ADMIN" && (
              <Link
                href="/admin/discussions/settings"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Settings
              </Link>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="SOLVED">Solved</option>
              <option value="CLOSED">Closed</option>
              <option value="LOCKED">Locked</option>
              <option value="REPORTED">Reported</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="overflow-x-auto py-4">
              <table className="w-full">
                <tbody>
                  <TableRowsSkeleton rows={6} cols={8} />
                </tbody>
              </table>
            </div>
          ) : discussions.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No discussions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Course</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Replies</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Views</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">Created</th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discussions.map((discussion) => (
                    <tr key={discussion.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/discussions/${discussion.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium truncate max-w-md"
                        >
                          {discussion.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{discussion.student.name}</td>
                      <td className="py-3 px-4 text-slate-700">{discussion.course.title}</td>
                      <td className="py-3 px-4 text-center text-slate-700">{discussion.replyCount}</td>
                      <td className="py-3 px-4 text-center text-slate-700">{discussion.viewCount}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {discussion.isPinned && <Pin size={14} className="text-yellow-500" />}
                          {discussion.isLocked && <Lock size={14} className="text-red-500" />}
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${getStatusColor(discussion.status)}`}>
                            {discussion.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(discussion.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/admin/discussions/${discussion.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-200 transition"
                        >
                          <MoreVertical size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-4 py-2 rounded-lg transition ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 hover:border-blue-600"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/discussions/reports"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-red-500"
          >
            <AlertCircle className="text-red-500 mb-2" size={24} />
            <h3 className="font-semibold text-slate-900 mb-1">Reports</h3>
            <p className="text-sm text-slate-600">Review reported content and moderation requests</p>
          </Link>

          {userRole === "ADMIN" && (
            <>
              <Link
                href="/admin/discussions/categories"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-purple-500"
              >
                <MessageSquare className="text-purple-500 mb-2" size={24} />
                <h3 className="font-semibold text-slate-900 mb-1">Categories</h3>
                <p className="text-sm text-slate-600">Manage discussion categories and tags</p>
              </Link>

              <Link
                href="/admin/discussions/analytics"
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition border-l-4 border-green-500"
              >
                <TrendingUp className="text-green-500 mb-2" size={24} />
                <h3 className="font-semibold text-slate-900 mb-1">Analytics</h3>
                <p className="text-sm text-slate-600">View discussion engagement and trends</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

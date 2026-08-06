"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  FaBell,
  FaBookOpen,
  FaCheckDouble,
  FaFileCircleCheck,
  FaGraduationCap,
  FaHouse,
  FaRightFromBracket,
  FaUserTie,
} from "react-icons/fa6";
import { API_URL } from "@/lib/api";
import { getAuthTokenWithRefresh } from "@/services/authService";

const NAV_ITEMS = [
  { label: "Faculty Overview", href: "/instructor", Icon: FaHouse },
  { label: "Course Content Builder", href: "/instructor/courses", Icon: FaBookOpen },
  { label: "Grading Desk", href: "/instructor/assignments", Icon: FaFileCircleCheck },
  { label: "Notifications", href: "/instructor/notifications", Icon: FaBell },
];

export default function InstructorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const authToken = await getAuthTokenWithRefresh();
        if (!authToken) return;

        const response = await fetch(`${API_URL}/notifications/unread/count`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#EDE6D3] text-[#2A2A28] dark:bg-[#070B19] dark:text-slate-200">
      <aside className="hidden w-64 shrink-0 border-r border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A] lg:flex lg:flex-col lg:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 px-2 py-1">
            <div className="relative h-9 w-9">
              <Image src="/Genvalue Light.svg" alt="GenValue Logo" fill className="object-contain dark:hidden" priority />
              <Image src="/Genvalue Dark.svg" alt="GenValue Logo" fill className="hidden object-contain dark:block" priority />
            </div>
            <span className="font-display-custom text-xl font-extrabold tracking-tight">
              <span className="text-[#2A2A28] dark:text-white">Gen</span>
              <span className="text-[#1E3FE0] dark:text-[#60A5FA]">Value</span>
            </span>
            <span className="ml-1 rounded-full bg-[#E8622E]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#E8622E]">
              FACULTY
            </span>
          </Link>

          <nav className="mt-8 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const isNotifications = item.href === "/instructor/notifications";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition ${
                    active
                      ? "bg-[#E8622E] text-white shadow-md"
                      : "text-[#6B6558] hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5"
                  }`}
                  aria-label={
                    isNotifications && notificationCount > 0
                      ? `Notifications, ${notificationCount} unread`
                      : item.label
                  }
                >
                  <item.Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {isNotifications && notificationCount > 0 && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E8622E] px-1 text-[10px] font-bold text-white">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-black/10 pt-4 dark:border-white/10">
          <div className="mb-3 flex items-center gap-3 px-2">
            <FaUserTie className="h-8 w-8 text-[#E8622E]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[#2A2A28] dark:text-white">Faculty Instructor</p>
              <p className="truncate text-[10px] font-medium text-[#6B6558] dark:text-slate-400">instructor@gmail.com</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-white/10 dark:bg-white/5 dark:text-red-400"
          >
            <FaRightFromBracket className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaAward,
  FaBars,
  FaBell,
  FaBookOpen,
  FaCircleCheck,
  FaFileLines,
  FaGraduationCap,
  FaHouse,
  FaListCheck,
  FaMagnifyingGlass,
  FaMessage,
  FaNewspaper,
  FaRightFromBracket,
  FaGear,
  FaUserGear,
  FaXmark,
} from "react-icons/fa6";
import { signOut as firebaseSignOut, restoreLmsSessionIfNeeded } from "@/services/authService";
import { useLmsPortalPath } from "@/hooks/useLmsPortalPath";
import { getStoredPortalSessionId } from "@/lib/lmsSession";
import { ensurePortalAuthToken } from "@/lib/portalAuth";
import { API_URL } from "@/lib/api";
import Avatar from "@/components/ui/Avatar";
import { applyLiquidGlass } from "@/lib/liquid-glass";
import { PortalLayoutSkeleton } from "@/components/skeletons";

const NAV_PATHS = [
  { label: "Dashboard", path: "/dashboard", Icon: FaHouse },
  { label: "My Learning", path: "/dashboard/courses", Icon: FaBookOpen },
  { label: "Browse Courses", path: "/dashboard/browse-courses", Icon: FaGraduationCap },
  { label: "Quizzes", path: "/dashboard/quizzes", Icon: FaListCheck },
  { label: "Assignments", path: "/dashboard/assignments", Icon: FaFileLines },
  { label: "Certificates", path: "/dashboard/certificates", Icon: FaAward },
  { label: "Discussions", path: "/dashboard/discussions", Icon: FaMessage },
  { label: "The Dispatch", path: "/dashboard/dispatch", Icon: FaNewspaper },
  { label: "Notifications", path: "/dashboard/notifications", Icon: FaBell },
  { label: "Settings", path: "/dashboard/settings", Icon: FaGear },
  { label: "My Profile", path: "/dashboard/profile", Icon: FaUserGear },
];

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toPortal, portalRoot } = useLmsPortalPath();
  const navItems = NAV_PATHS.map((item) => ({ ...item, href: toPortal(item.path) }));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // New state for fully hiding sidebar
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const navbarRef = useRef<HTMLDivElement>(null);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const authToken = await ensurePortalAuthToken();
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
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navGlassKey = loading ? "idle" : `glass-${sidebarOpen}`;

  // Apply liquid glass refraction once navbar is mounted (after auth loading)
  useEffect(() => {
    if (loading) return;

    const el = navbarRef.current;
    if (!el) return;

    let glass: ReturnType<typeof applyLiquidGlass> | null = null;
    let raf1 = 0;
    let raf2 = 0;
    let raf3 = 0;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        glass = applyLiquidGlass(el, {
          scale: -132,
          chroma: 8,
          border: 0.08,
          mapBlur: 14,
          blur: 3,
          saturate: 1.45,
          fallbackBlur: 18,
        });
        glass.refresh();
        raf3 = requestAnimationFrame(() => glass?.refresh());
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      cancelAnimationFrame(raf3);
      glass?.destroy();
    };
  }, [navGlassKey]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await restoreLmsSessionIfNeeded();

        const portalSession = getStoredPortalSessionId();
        if (!portalSession) {
          router.replace("/auth/login");
          return;
        }

        let authToken = await ensurePortalAuthToken();

        if (!authToken) {
          router.replace("/auth/login");
          return;
        }

        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data.data);
        } else if (response.status === 401) {
          authToken = await ensurePortalAuthToken();
          if (!authToken) {
            router.replace("/auth/login");
            return;
          }
          const retry = await fetch(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (retry.ok) {
            const data = await retry.json();
            setUserData(data.data);
          } else {
            router.replace("/auth/login");
            return;
          }
        } else {
          console.error("Profile fetch failed with status:", response.status);
          setUserData(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleSignOut = async () => {
    await firebaseSignOut();
    router.replace("/");
  };

  if (loading) {
    return <PortalLayoutSkeleton portal="lms" />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#EDE6D3] text-[#2A2A28] dark:bg-[#070B19] dark:text-slate-200">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:linear-gradient(#000_1px,transparent_1px),linear-gradient(90deg,#000_1px,transparent_1px)] [background-size:24px_24px] dark:opacity-[0.06] dark:[background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)]"
        aria-hidden="true"
      />

      {/* Desktop Sidebar - Can be fully hidden */}
      {sidebarOpen && (
        <aside className={`relative hidden h-screen shrink-0 flex-col justify-between overflow-y-auto border-r border-black/10 bg-[#F6F1E4] p-6 transition-all duration-300 dark:border-white/10 dark:bg-[#0D1B2A] lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div>
            <div className="flex items-center justify-between">
              <Link href="/" className={`flex items-center gap-2 px-2 py-1 ${sidebarCollapsed ? 'hidden' : ''}`} onClick={(e) => e.preventDefault()}>
                <div className="relative h-9 w-9">
                  <Image src="/Genvalue Light.svg" alt="GenValue Logo" fill className="object-contain dark:hidden" priority loading="eager" />
                  <Image src="/Genvalue Dark.svg" alt="GenValue Logo" fill className="hidden object-contain dark:block" priority loading="eager" />
                </div>
                <span className="font-display-custom text-xl font-extrabold tracking-tight">
                  <span className="text-[#2A2A28] dark:text-white">Gen</span>
                  <span className="text-[#1E3FE0] dark:text-[#60A5FA]">Value</span>
                </span>
                <span className="ml-1 rounded-full bg-[#1E3FE0]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]">
                  LMS
                </span>
              </Link>
              
              {/* Close (X) Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5"
                title="Close sidebar"
              >
                <FaXmark className="h-5 w-5 text-[#2A2A28] dark:text-white" />
              </button>
            </div>

          <nav className="mt-8 space-y-1.5">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.path !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition ${
                    active
                      ? "bg-[#1E3FE0] text-white shadow-md dark:bg-[#60A5FA] dark:text-[#070B19]"
                      : "text-[#6B6558] hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5"
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.Icon className="h-4 w-4" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-black/10 pt-4 dark:border-white/10">
          {!sidebarCollapsed && (
            <>
              <div className="mb-3 flex items-center gap-3 px-2">
                <Avatar
                  src={userData?.profilePicture}
                  name={userData?.name || "User"}
                  size="sm"
                  className="border border-black/10 dark:border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#2A2A28] dark:text-white">
                    {userData?.name || "User"}
                  </p>
                  <p className="truncate text-[10px] font-medium text-[#6B6558] dark:text-slate-400">
                    {userData?.email || ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 dark:border-white/10 dark:bg-white/5 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <FaRightFromBracket className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
          {sidebarCollapsed && (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center justify-center rounded-xl border border-black/10 bg-white/50 p-2 text-red-600 transition hover:bg-red-50 dark:border-white/10 dark:bg-white/5 dark:text-red-400 dark:hover:bg-red-950/30"
              title="Sign Out"
            >
              <FaRightFromBracket className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>
      )}

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden"
              style={{ zIndex: 40 }}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-72 overflow-y-auto border-r border-black/10 bg-[#F6F1E4] p-6 shadow-2xl dark:border-white/10 dark:bg-[#0D1B2A] lg:hidden"
              style={{ zIndex: 50 }}
            >
              <div className="flex h-full flex-col justify-between">

                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative h-9 w-9">
                        <Image src="/Genvalue Light.svg" alt="GenValue Logo" fill className="object-contain dark:hidden" priority loading="eager" />
                        <Image src="/Genvalue Dark.svg" alt="GenValue Logo" fill className="hidden object-contain dark:block" priority loading="eager" />
                      </div>
                      <span className="font-display-custom text-xl font-extrabold tracking-tight">
                        <span className="text-[#2A2A28] dark:text-white">Gen</span>
                        <span className="text-[#1E3FE0] dark:text-[#60A5FA]">Value</span>
                      </span>
                      <span className="ml-1 rounded-full bg-[#1E3FE0]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#1E3FE0] dark:bg-[#60A5FA]/20 dark:text-[#60A5FA]">
                        LMS
                      </span>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/5">
                      <FaXmark className="h-5 w-5" />
                    </button>
                  </div>
                  <nav className="space-y-1.5">
                    {navItems.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.path !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                            active
                              ? "bg-[#1E3FE0] text-white shadow-md dark:bg-[#60A5FA] dark:text-[#070B19]"
                              : "text-[#6B6558] hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5"
                          }`}
                        >
                          <item.Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="border-t border-black/10 pt-4 dark:border-white/10">
                  <div className="mb-3 flex items-center gap-3">
                    <Avatar src={userData?.profilePicture} name={userData?.name || "User"} size="md" className="border border-black/10 dark:border-white/10" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#2A2A28] dark:text-white">{userData?.name || "User"}</p>
                      <p className="truncate text-xs font-medium text-[#6B6558] dark:text-slate-400">{userData?.email || ""}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-white/10 dark:bg-white/5 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <FaRightFromBracket className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="relative min-w-0 flex-1 overflow-y-auto">
        <header className="sticky top-4 z-50 px-4 pb-4 sm:px-6 sm:pb-5">
          <div
            ref={navbarRef}
            className="liquid-glass-navbar mx-auto flex max-w-[1240px] items-center justify-between gap-3 rounded-full px-4 py-2.5 shadow-md transition-all duration-300 sm:gap-4 sm:px-5"
          >
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              {!sidebarOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(true);
                    setSidebarCollapsed(false);
                  }}
                  aria-label="Open sidebar"
                  className="hidden rounded-full p-2 text-[#2A2A28] transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/10 lg:inline-flex"
                >
                  <FaBars className="h-5 w-5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Open navigation menu"
                className="inline-flex rounded-full p-2 text-[#2A2A28] transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/10 lg:hidden"
              >
                <FaBars className="h-5 w-5" />
              </button>

              <Link href={portalRoot} className="flex shrink-0 items-center gap-2" aria-label="GenValue LMS home">
                <div className="relative h-7 w-7 sm:h-8 sm:w-8">
                  <Image src="/Genvalue Light.svg" alt="GenValue Logo" fill className="object-contain dark:hidden" priority loading="eager" />
                  <Image src="/Genvalue Dark.svg" alt="GenValue Logo" fill className="hidden object-contain dark:block" priority loading="eager" />
                </div>
                <span className="font-display-custom text-sm font-extrabold tracking-tight sm:text-base">
                  <span className="text-[#2A2A28] dark:text-white">Gen</span>
                  <span className="text-[#1E3FE0] dark:text-[#60A5FA]">Value</span>
                  <span className="ml-1.5 rounded-full bg-[#1E3FE0]/10 px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#1E3FE0] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA]">
                    LMS
                  </span>
                </span>
              </Link>
            </div>

            <div className="hidden min-w-0 flex-1 max-w-md lg:block">
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6558] dark:text-slate-400" />
                <input
                  type="search"
                  placeholder="Search courses, quizzes, assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search courses, quizzes, and assignments"
                  className="w-full rounded-full border border-black/10 bg-white/40 py-2 pl-11 pr-4 text-sm font-medium text-[#2A2A28] placeholder:text-[#6B6558]/60 outline-none transition focus:border-[#1E3FE0] focus:bg-white/70 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-slate-400/60 dark:focus:border-[#60A5FA] dark:focus:bg-white/20"
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Link
                href={toPortal("/dashboard/notifications")}
                aria-label={`Notifications${notificationCount > 0 ? `, ${notificationCount} unread` : ""}`}
                className="relative rounded-full p-2 text-[#2A2A28] transition-colors hover:bg-black/5 dark:text-white dark:hover:bg-white/10"
              >
                <FaBell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#E8622E] text-[10px] font-bold text-white">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Link>
              <Link
                href={toPortal("/dashboard/profile")}
                aria-label="My profile"
                className="hidden shrink-0 rounded-full p-0.5 transition hover:ring-2 hover:ring-[#1E3FE0]/20 dark:hover:ring-[#60A5FA]/20 lg:block"
              >
                <Avatar
                  src={userData?.profilePicture}
                  name={userData?.name || "User"}
                  size="sm"
                  className="border-2 border-white/80 ring-1 ring-black/5 dark:border-white/20 dark:ring-white/10"
                />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-2 max-w-[1240px] lg:hidden">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6558] dark:text-slate-400" />
            <input
              type="search"
              placeholder="Search courses, quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search courses and quizzes"
              className="w-full rounded-full border border-black/10 bg-[#F6F1E4]/80 py-2.5 pl-11 pr-4 text-sm font-medium text-[#2A2A28] placeholder:text-[#6B6558]/60 outline-none backdrop-blur-sm transition focus:border-[#1E3FE0] focus:bg-white dark:border-white/10 dark:bg-[#0D1B2A]/80 dark:text-white dark:placeholder:text-slate-400/60 dark:focus:border-[#60A5FA]"
            />
          </div>
        </header>

        <main className="px-4 pb-10 pt-2 sm:px-6 sm:pt-4 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

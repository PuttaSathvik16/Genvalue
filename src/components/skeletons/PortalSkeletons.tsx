import { Skeleton } from "@/components/ui/Skeleton";

interface CountProps {
  count?: number;
}

interface ColsProps extends CountProps {
  cols?: 2 | 3 | 4;
}

/** Full portal shell while layout auth/profile loads. */
export function PortalLayoutSkeleton({ portal = "lms" }: { portal?: "lms" | "admin" }) {
  const navCount = portal === "admin" ? 6 : 9;

  return (
    <div
      className="flex h-screen overflow-hidden bg-[#EDE6D3] dark:bg-[#070B19]"
      aria-busy="true"
      aria-label="Loading portal"
    >
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A] lg:flex">
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-6 w-28" />
        </div>
        <nav className="mt-8 space-y-2">
          {Array.from({ length: navCount }).map((_, index) => (
            <Skeleton key={index} className="h-11 w-full rounded-2xl" />
          ))}
        </nav>
        <div className="mt-auto space-y-3 border-t border-black/10 pt-4 dark:border-white/10">
          <div className="flex items-center gap-3 px-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="sticky top-4 z-10 px-4 pb-4 sm:px-6">
          <Skeleton className="mx-auto h-14 max-w-[1240px] rounded-full" />
        </div>
        <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-8 sm:px-6">
          <PortalPageHeaderSkeleton hasAction />
          <StatCardsSkeleton count={4} />
          <CardGridSkeleton count={portal === "admin" ? 5 : 3} cols={portal === "admin" ? 4 : 3} />
        </div>
      </div>
    </div>
  );
}

/** Hero header card used on most portal pages. */
export function PortalPageHeaderSkeleton({ hasAction = false }: { hasAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A] sm:flex-row sm:items-center sm:justify-between lg:p-8">
      <div className="flex-1 space-y-3">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-8 w-64 max-w-full sm:h-9" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      {hasAction && <Skeleton className="h-12 w-44 shrink-0 rounded-full" />}
    </div>
  );
}

/** Compact page title block (no card wrapper). */
export function PortalTitleSkeleton({ hasAction = false }: { hasAction?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {hasAction && <Skeleton className="h-11 w-40 shrink-0 rounded-full" />}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4, cols = 4 }: ColsProps) {
  const gridClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-3 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function QuickLinksSkeleton({ count = 5, cols = 4 }: ColsProps) {
  const gridClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-4 text-center dark:border-white/10 dark:bg-[#0D1B2A]"
        >
          <Skeleton className="mx-auto h-6 w-6 rounded-lg" />
          <Skeleton className="mx-auto mt-3 h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3, cols = 3 }: ColsProps) {
  const gridClass =
    cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-black/10 bg-[#F6F1E4] dark:border-white/10 dark:bg-[#0D1B2A]"
        >
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-2 h-9 w-28 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FiltersBarSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Skeleton className="h-11 min-w-[200px] flex-1 rounded-2xl" />
      {Array.from({ length: fields - 1 }).map((_, index) => (
        <Skeleton key={index} className="h-11 w-36 rounded-2xl" />
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-4">
              <Skeleton
                className={`h-4 ${
                  colIndex === 0 ? "w-6" : colIndex === 1 ? "w-36" : colIndex === cols - 1 ? "w-16 ml-auto" : "w-24"
                }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TablePageSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading table">
      <PortalTitleSkeleton hasAction />
      <StatCardsSkeleton count={4} cols={4} />
      <FiltersBarSkeleton fields={3} />
      <div className="overflow-hidden rounded-3xl border border-black/10 bg-[#F6F1E4] dark:border-white/10 dark:bg-[#0D1B2A]">
        <div className="border-b border-black/10 px-4 py-3 dark:border-white/10">
          <Skeleton className="h-4 w-48" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/10">
              {Array.from({ length: cols }).map((_, index) => (
                <th key={index} className="px-4 py-3">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/5">
            <TableRowsSkeleton rows={rows} cols={cols} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DiscussionListSkeleton({ count = 4 }: CountProps) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading discussions">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListItemsSkeleton({ count = 5 }: CountProps) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading list">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-start gap-4 rounded-2xl border border-black/10 bg-[#F6F1E4] p-4 dark:border-white/10 dark:bg-[#0D1B2A]"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      <PortalTitleSkeleton />
      <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
          <div className="w-full flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-busy="true" aria-label="Loading details">
      <Skeleton className="h-4 w-32" />
      <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A] sm:p-8">
        <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-3/4" />
          </div>
          <Skeleton className="h-10 w-36 rounded-full" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-6 h-32 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function AssignmentsListSkeleton({ count = 4 }: CountProps) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading assignments">
      <PortalTitleSkeleton />
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-28 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-4 w-full max-w-xl" />
        </div>
      ))}
    </div>
  );
}

export function AnnouncementsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading announcements">
      <PortalTitleSkeleton hasAction />
      <ListItemsSkeleton count={5} />
    </div>
  );
}

export function AuditLogsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading audit logs">
      <PortalTitleSkeleton />
      <FiltersBarSkeleton fields={4} />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64 max-w-full" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SecurityPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading security report">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Skeleton className="h-11 w-36 rounded-full" />
      </div>
      <StatCardsSkeleton count={4} cols={4} />
      <Skeleton className="h-24 w-full rounded-3xl" />
      {Array.from({ length: 3 }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="overflow-hidden rounded-3xl border border-black/10 bg-[#F6F1E4] shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]"
        >
          <div className="flex gap-3 border-b border-black/10 px-5 py-5 dark:border-white/10 sm:px-6">
            <Skeleton className="h-10 w-10 shrink-0 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-full max-w-md" />
            </div>
          </div>
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {Array.from({ length: 4 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="border-l-4 border-l-black/10 px-5 py-4 dark:border-l-white/10 sm:px-6"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-28 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full max-w-lg" />
                  </div>
                  <Skeleton className="h-8 w-32 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** LMS student dashboard home. */
export function LmsDashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      <PortalPageHeaderSkeleton hasAction />
      <StatCardsSkeleton count={4} cols={4} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A]">
          <Skeleton className="h-5 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 dark:border-white/10 dark:bg-[#0D1B2A]">
          <Skeleton className="h-5 w-36" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Admin analytics dashboard home. */
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading admin dashboard">
      <PortalPageHeaderSkeleton hasAction />
      <QuickLinksSkeleton count={5} cols={4} />
      <StatCardsSkeleton count={4} cols={4} />
      <div className="rounded-3xl border border-black/10 bg-[#F6F1E4] p-6 shadow-xl dark:border-white/10 dark:bg-[#0D1B2A]">
        <Skeleton className="h-6 w-48" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading settings">
      <PortalTitleSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-black/10 bg-[#F6F1E4] p-6 shadow-lg dark:border-white/10 dark:bg-[#0D1B2A]"
          >
            <Skeleton className="h-5 w-36" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDetailPanelSkeleton() {
  return (
    <div className="min-h-[60vh] space-y-6 p-6" aria-busy="true" aria-label="Loading content">
      <Skeleton className="h-4 w-40" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-lg bg-white p-8 shadow-md dark:bg-[#0D1B2A]">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
            <Skeleton className="mt-6 h-40 w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-[#0D1B2A]">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-4 h-10 w-full rounded-xl" />
            <Skeleton className="mt-3 h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

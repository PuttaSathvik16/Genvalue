/** Shared formatting and styling for blog UI. */

export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

export function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

const CATEGORY_BADGE: Record<string, string> = {
  Marketing:
    "bg-rose-500/15 text-rose-800 ring-rose-500/25 dark:bg-rose-500/20 dark:text-rose-200 dark:ring-rose-400/30",
  "General AI":
    "bg-sky-500/15 text-sky-800 ring-sky-500/25 dark:bg-sky-500/20 dark:text-sky-200 dark:ring-sky-400/30",
  "AI Agents":
    "bg-violet-500/15 text-violet-800 ring-violet-500/25 dark:bg-violet-500/20 dark:text-violet-200 dark:ring-violet-400/30",
  Automation:
    "bg-amber-500/15 text-amber-900 ring-amber-500/25 dark:bg-amber-500/20 dark:text-amber-100 dark:ring-amber-400/30",
  Strategy:
    "bg-emerald-500/15 text-emerald-900 ring-emerald-500/25 dark:bg-emerald-500/20 dark:text-emerald-100 dark:ring-emerald-400/30",
};

export function categoryBadgeClass(category: string): string {
  return (
    CATEGORY_BADGE[category] ??
    "bg-zinc-500/15 text-zinc-800 ring-zinc-500/20 dark:bg-zinc-500/20 dark:text-zinc-200 dark:ring-zinc-400/25"
  );
}

export function blogCategoriesFromPosts(categories: readonly string[]): string[] {
  return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
}

export type PlannerCategory = "STUDY" | "ASSIGNMENT" | "QUIZ" | "LIVE" | "PERSONAL" | "BREAK";

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmap {
  days: HeatmapDay[];
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  startDate: string;
  endDate: string;
}

export interface PlannerEvent {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: PlannerCategory;
  scheduledAt: string;
  endAt: string | null;
  allDay: boolean;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerInsights {
  weekPlanned: number;
  weekCompleted: number;
  weekCompletionRate: number;
  monthPlanned: number;
  monthCompleted: number;
  monthCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
  activeDays: number;
  topCategory: PlannerCategory | null;
  upcoming: PlannerEvent[];
}

export const PLANNER_CATEGORY_LABELS: Record<PlannerCategory, string> = {
  STUDY: "Study",
  ASSIGNMENT: "Assignment",
  QUIZ: "Quiz prep",
  LIVE: "Live session",
  PERSONAL: "Personal",
  BREAK: "Break",
};

export const PLANNER_CATEGORY_COLORS: Record<PlannerCategory, string> = {
  STUDY: "#1E3FE0",
  ASSIGNMENT: "#E8622E",
  QUIZ: "#10B981",
  LIVE: "#8B5CF6",
  PERSONAL: "#F59E0B",
  BREAK: "#6B6558",
};

export const HEATMAP_LEVEL_CLASSES: Record<number, string> = {
  0: "bg-[#ebedf0] dark:bg-white/8",
  1: "bg-[#9be9a8] dark:bg-emerald-900/50",
  2: "bg-[#40c463] dark:bg-emerald-600/70",
  3: "bg-[#30a14e] dark:bg-emerald-500",
  4: "bg-[#216e39] dark:bg-emerald-400",
};

export type BugReportCategory = "BUG" | "LOGIN" | "COURSE" | "DISPATCH" | "OTHER";

export type BugReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface BugReport {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: BugReportCategory;
  title: string;
  description: string;
  pageUrl: string | null;
  screenshotUrl: string | null;
  userAgent: string | null;
  status: BugReportStatus;
  adminNotes: string | null;
  resolvedByEmail: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BugReportListMeta {
  total: number;
  filtered?: number;
  openCount: number;
  inProgressCount: number;
}

export const BUG_REPORT_CATEGORY_LABELS: Record<BugReportCategory, string> = {
  BUG: "Bug / Error",
  LOGIN: "Login / Access",
  COURSE: "Course / Learning",
  DISPATCH: "The Dispatch",
  OTHER: "Other",
};

export const BUG_REPORT_STATUS_LABELS: Record<BugReportStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

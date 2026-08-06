/** Who should see a published announcement. */
export type AnnouncementTargetAudience = "ALL" | "STUDENTS" | "INSTRUCTORS";

export const ANNOUNCEMENT_TARGET_AUDIENCES: readonly AnnouncementTargetAudience[] = [
  "ALL",
  "STUDENTS",
  "INSTRUCTORS",
] as const;

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<AnnouncementTargetAudience, string> = {
  ALL: "All roles",
  STUDENTS: "Students",
  INSTRUCTORS: "Instructors",
};

/** Display name for announcement notifications in student/instructor portals. */
export const ANNOUNCEMENT_SENDER_NAME = "GenValue Admin";

export function formatAnnouncementAudience(
  audience: string | undefined | null
): string {
  if (audience && audience in ANNOUNCEMENT_AUDIENCE_LABELS) {
    return ANNOUNCEMENT_AUDIENCE_LABELS[audience as AnnouncementTargetAudience];
  }
  return ANNOUNCEMENT_AUDIENCE_LABELS.ALL;
}

export function getAnnouncementAudienceBadgeClass(audience: string): string {
  switch (audience) {
    case "STUDENTS":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200";
    case "INSTRUCTORS":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
    default:
      return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200";
  }
}

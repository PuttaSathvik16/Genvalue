import { prisma } from "../config/database.js";

/** Auto-seeded placeholder removed — only admin-created announcements should appear. */
const LEGACY_SEED_ANNOUNCEMENTS = [
  {
    title: "Live Mentorship Office Hours",
    message:
      "Join Sathvik Putta every Thursday at 7:00 PM IST for live project reviews and Q&A.",
    description: "Weekly live Q&A with your instructor",
  },
];

const VALID_AUDIENCES = ["ALL", "STUDENTS", "INSTRUCTORS"];

/** Normalize admin-provided audience to a supported value. */
export function normalizeTargetAudience(value) {
  const normalized = String(value ?? "ALL").toUpperCase();
  return VALID_AUDIENCES.includes(normalized) ? normalized : "ALL";
}

/** Prisma OR filter for announcements visible to a user role. */
export function audienceFilterForRole(role) {
  const normalizedRole = String(role ?? "STUDENT").toUpperCase();

  if (normalizedRole === "INSTRUCTOR") {
    return [{ targetAudience: "ALL" }, { targetAudience: "INSTRUCTORS" }];
  }

  // Students and other LMS users
  return [{ targetAudience: "ALL" }, { targetAudience: "STUDENTS" }];
}

let legacySeedCleanupDone = false;

/** One-time cleanup of dev seed rows inserted before admin-only announcements. */
export async function removeLegacySeedAnnouncements() {
  if (legacySeedCleanupDone) return { removed: 0 };

  try {
    let removed = 0;
    for (const seed of LEGACY_SEED_ANNOUNCEMENTS) {
      const result = await prisma.announcement.deleteMany({
        where: {
          title: seed.title,
          message: seed.message,
          description: seed.description,
        },
      });
      removed += result.count;
    }

    legacySeedCleanupDone = true;
    if (removed > 0) {
      console.log(`🧹 Removed ${removed} legacy mock announcement(s) from database`);
    }
    return { removed };
  } catch (error) {
    console.warn(
      "Could not remove legacy mock announcements:",
      error instanceof Error ? error.message : error
    );
    return { removed: 0 };
  }
}

/** Active published announcements visible to the given user role. */
export async function getPublishedAnnouncementsForRole(role, limit = 5) {
  await removeLegacySeedAnnouncements();

  const now = new Date();
  const audienceFilters = audienceFilterForRole(role);

  return prisma.announcement.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: now },
      AND: [
        {
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        {
          OR: audienceFilters,
        },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      message: true,
      description: true,
      type: true,
      priority: true,
      targetAudience: true,
      publishedAt: true,
    },
  });
}

/** Default in-app link when an announcement notification is opened. */
export function announcementNotificationActionUrl(role) {
  const normalizedRole = String(role ?? "STUDENT").toUpperCase();
  return normalizedRole === "INSTRUCTOR" ? "/instructor/notifications" : "/dashboard";
}

/**
 * Ensure published announcements for this user's role have a notification row.
 * Backfills users who registered after an announcement was published.
 */
export async function syncAnnouncementNotificationsForUser(userId, role) {
  const announcements = await getPublishedAnnouncementsForRole(role, 100);
  if (announcements.length === 0) return { created: 0 };

  const existing = await prisma.notification.findMany({
    where: {
      userId,
      announcementId: { in: announcements.map((a) => a.id) },
    },
    select: { announcementId: true },
  });

  const existingIds = new Set(existing.map((n) => n.announcementId));
  const missing = announcements.filter((a) => !existingIds.has(a.id));

  if (missing.length === 0) return { created: 0 };

  const actionUrl = announcementNotificationActionUrl(role);

  await prisma.notification.createMany({
    data: missing.map((announcement) => ({
      userId,
      announcementId: announcement.id,
      title: announcement.title,
      message: announcement.description || announcement.message,
      type: "ANNOUNCEMENT",
      actionUrl,
      actionLabel: "View",
    })),
  });

  return { created: missing.length };
}

/** @deprecated Use getPublishedAnnouncementsForRole("STUDENT", limit) */
export async function getPublishedAnnouncementsForStudents(limit = 5) {
  return getPublishedAnnouncementsForRole("STUDENT", limit);
}

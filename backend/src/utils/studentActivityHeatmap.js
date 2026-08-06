import { prisma } from "../config/database.js";

const HEATMAP_DAYS = 371;

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function countToLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function bumpCount(map, dateValue, amount = 1) {
  if (!dateValue) return;
  const key = toDateKey(new Date(dateValue));
  map.set(key, (map.get(key) ?? 0) + amount);
}

export async function recordStudentActivity(userId, type, label = null) {
  await prisma.studentActivityLog.create({
    data: {
      userId,
      type,
      label,
      occurredAt: new Date(),
    },
  });
}

export async function buildStudentActivityHeatmap(userId) {
  const end = startOfUtcDay(new Date());
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (HEATMAP_DAYS - 1));

  const counts = new Map();

  const [
    activityLogs,
    lessonProgress,
    quizResponses,
    assignmentSubmissions,
    plannerEvents,
    sessions,
  ] = await Promise.all([
    prisma.studentActivityLog.findMany({
      where: { userId, occurredAt: { gte: start } },
      select: { occurredAt: true },
    }),
    prisma.lessonProgress.findMany({
      where: {
        userId,
        OR: [{ updatedAt: { gte: start } }, { completedAt: { gte: start } }],
      },
      select: { updatedAt: true, completedAt: true },
    }),
    prisma.quizResponse.findMany({
      where: { userId, attemptedAt: { gte: start } },
      select: { attemptedAt: true },
    }),
    prisma.assignmentSubmission.findMany({
      where: {
        userId,
        OR: [{ submittedAt: { gte: start } }, { createdAt: { gte: start } }],
      },
      select: { submittedAt: true, createdAt: true },
    }),
    prisma.studentPlannerEvent.findMany({
      where: {
        userId,
        OR: [{ scheduledAt: { gte: start } }, { completedAt: { gte: start } }],
      },
      select: { scheduledAt: true, completedAt: true, completed: true },
    }),
    prisma.session.findMany({
      where: { userId, lastAccessedAt: { gte: start } },
      select: { lastAccessedAt: true },
    }),
  ]);

  for (const row of activityLogs) bumpCount(counts, row.occurredAt);
  for (const row of lessonProgress) {
    bumpCount(counts, row.updatedAt);
    if (row.completedAt) bumpCount(counts, row.completedAt, 2);
  }
  for (const row of quizResponses) bumpCount(counts, row.attemptedAt, 2);
  for (const row of assignmentSubmissions) {
    bumpCount(counts, row.submittedAt ?? row.createdAt, 2);
  }
  for (const row of plannerEvents) {
    bumpCount(counts, row.scheduledAt);
    if (row.completed && row.completedAt) bumpCount(counts, row.completedAt, 2);
  }
  for (const row of sessions) bumpCount(counts, row.lastAccessedAt);

  const days = [];
  let totalContributions = 0;
  const cursor = new Date(start);

  while (cursor <= end) {
    const key = toDateKey(cursor);
    const count = counts.get(key) ?? 0;
    totalContributions += count;
    days.push({
      date: key,
      count,
      level: countToLevel(count),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i -= 1) {
    if (days[i].count > 0) currentStreak += 1;
    else break;
  }

  let longestStreak = 0;
  let streak = 0;
  for (const day of days) {
    if (day.count > 0) {
      streak += 1;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  return {
    days,
    totalContributions,
    currentStreak,
    longestStreak,
    activeDays: days.filter((d) => d.count > 0).length,
    startDate: toDateKey(start),
    endDate: toDateKey(end),
  };
}

import { prisma } from "../config/database.js";
import {
  buildStudentActivityHeatmap,
  recordStudentActivity,
} from "../utils/studentActivityHeatmap.js";

const VALID_CATEGORIES = ["STUDY", "ASSIGNMENT", "QUIZ", "LIVE", "PERSONAL", "BREAK"];
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

function normalizeCategory(value) {
  const key = String(value ?? "STUDY")
    .trim()
    .toUpperCase();
  return VALID_CATEGORIES.includes(key) ? key : "STUDY";
}

function parseDateInput(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getActivityHeatmap(req, res) {
  try {
    const userId = req.user.uid;
    await recordStudentActivity(userId, "DASHBOARD", "Dashboard visit");
    const heatmap = await buildStudentActivityHeatmap(userId);

    res.json({ success: true, data: heatmap });
  } catch (error) {
    console.error("[planner] getActivityHeatmap error:", error);
    res.status(500).json({ success: false, message: "Failed to load activity heatmap" });
  }
}

export async function listPlannerEvents(req, res) {
  try {
    const userId = req.user.uid;
    const from = parseDateInput(req.query.from) ?? startOfDay(new Date());
    const to = parseDateInput(req.query.to) ?? endOfDay(new Date(Date.now() + 60 * 86400000));

    const events = await prisma.studentPlannerEvent.findMany({
      where: {
        userId,
        scheduledAt: { gte: from, lte: to },
      },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
    });

    res.json({ success: true, data: events });
  } catch (error) {
    console.error("[planner] listPlannerEvents error:", error);
    res.status(500).json({ success: false, message: "Failed to load planner events" });
  }
}

export async function createPlannerEvent(req, res) {
  try {
    const userId = req.user.uid;
    const { title, description, category, scheduledAt, endAt, allDay } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const start = parseDateInput(scheduledAt);
    if (!start) {
      return res.status(400).json({ success: false, message: "Valid scheduled date/time is required" });
    }

    const event = await prisma.studentPlannerEvent.create({
      data: {
        userId,
        title: title.trim().slice(0, MAX_TITLE_LENGTH),
        description: description?.trim()?.slice(0, MAX_DESCRIPTION_LENGTH) || null,
        category: normalizeCategory(category),
        scheduledAt: start,
        endAt: parseDateInput(endAt),
        allDay: Boolean(allDay),
      },
    });

    await recordStudentActivity(userId, "PLANNER", `Planned: ${event.title}`);

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("[planner] createPlannerEvent error:", error);
    res.status(500).json({ success: false, message: "Failed to create planner event" });
  }
}

export async function updatePlannerEvent(req, res) {
  try {
    const userId = req.user.uid;
    const { id } = req.params;
    const { title, description, category, scheduledAt, endAt, allDay, completed } = req.body;

    const existing = await prisma.studentPlannerEvent.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Planner event not found" });
    }

    const nextCompleted =
      completed !== undefined ? Boolean(completed) : existing.completed;

    const updated = await prisma.studentPlannerEvent.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim().slice(0, MAX_TITLE_LENGTH) } : {}),
        ...(description !== undefined
          ? { description: description?.trim()?.slice(0, MAX_DESCRIPTION_LENGTH) || null }
          : {}),
        ...(category !== undefined ? { category: normalizeCategory(category) } : {}),
        ...(scheduledAt !== undefined
          ? { scheduledAt: parseDateInput(scheduledAt) ?? existing.scheduledAt }
          : {}),
        ...(endAt !== undefined ? { endAt: parseDateInput(endAt) } : {}),
        ...(allDay !== undefined ? { allDay: Boolean(allDay) } : {}),
        completed: nextCompleted,
        completedAt:
          nextCompleted && !existing.completed
            ? new Date()
            : !nextCompleted
              ? null
              : existing.completedAt,
      },
    });

    if (nextCompleted && !existing.completed) {
      await recordStudentActivity(userId, "PLANNER", `Completed: ${updated.title}`);
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[planner] updatePlannerEvent error:", error);
    res.status(500).json({ success: false, message: "Failed to update planner event" });
  }
}

export async function deletePlannerEvent(req, res) {
  try {
    const userId = req.user.uid;
    const { id } = req.params;

    const existing = await prisma.studentPlannerEvent.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Planner event not found" });
    }

    await prisma.studentPlannerEvent.delete({ where: { id } });

    res.json({ success: true, message: "Planner event deleted" });
  } catch (error) {
    console.error("[planner] deletePlannerEvent error:", error);
    res.status(500).json({ success: false, message: "Failed to delete planner event" });
  }
}

export async function getPlannerInsights(req, res) {
  try {
    const userId = req.user.uid;
    const now = new Date();
    const weekStart = startOfDay(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = endOfDay(new Date(weekStart));
    weekEnd.setDate(weekEnd.getDate() + 6);

    const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
    const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    const [weekEvents, monthEvents, heatmap] = await Promise.all([
      prisma.studentPlannerEvent.findMany({
        where: { userId, scheduledAt: { gte: weekStart, lte: weekEnd } },
      }),
      prisma.studentPlannerEvent.findMany({
        where: { userId, scheduledAt: { gte: monthStart, lte: monthEnd } },
      }),
      buildStudentActivityHeatmap(userId),
    ]);

    const weekPlanned = weekEvents.length;
    const weekCompleted = weekEvents.filter((e) => e.completed).length;
    const monthPlanned = monthEvents.length;
    const monthCompleted = monthEvents.filter((e) => e.completed).length;

    const upcoming = await prisma.studentPlannerEvent.findMany({
      where: {
        userId,
        completed: false,
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    });

    const categoryBreakdown = monthEvents.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] ?? 0) + 1;
      return acc;
    }, {});

    const topCategory =
      Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    res.json({
      success: true,
      data: {
        weekPlanned,
        weekCompleted,
        weekCompletionRate: weekPlanned ? Math.round((weekCompleted / weekPlanned) * 100) : 0,
        monthPlanned,
        monthCompleted,
        monthCompletionRate: monthPlanned ? Math.round((monthCompleted / monthPlanned) * 100) : 0,
        currentStreak: heatmap.currentStreak,
        longestStreak: heatmap.longestStreak,
        totalContributions: heatmap.totalContributions,
        activeDays: heatmap.activeDays,
        topCategory,
        upcoming,
      },
    });
  } catch (error) {
    console.error("[planner] getPlannerInsights error:", error);
    res.status(500).json({ success: false, message: "Failed to load planner insights" });
  }
}

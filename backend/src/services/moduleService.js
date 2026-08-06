import { prisma } from "../config/database.js";
import {
  buildLessonContent,
  defaultModuleContentMeta,
  lessonTypeFromString,
  parseLessonTopics,
  parseModuleContentMeta,
  serializeModuleContentMeta,
} from "../utils/moduleContentMeta.js";

function formatLesson(lesson) {
  let lessonMeta = { topics: [], description: "", lessonType: "VIDEO" };
  if (lesson.content) {
    try {
      lessonMeta = JSON.parse(lesson.content);
    } catch {
      /* ignore */
    }
  }

  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description ?? lessonMeta.description ?? "",
    type: lessonTypeFromString(lessonMeta.lessonType ?? "VIDEO"),
    duration: lesson.duration ?? null,
    status: lesson.status,
    order: lesson.order,
    videoUrl: lesson.videoUrl ?? null,
    topics: Array.isArray(lessonMeta.topics) ? lessonMeta.topics : parseLessonTopics(lesson.content),
  };
}

export async function getModuleAnalytics(courseId, week) {
  const [enrollmentCount, moduleProgress] = await Promise.all([
    prisma.enrollment.count({ where: { courseId, status: { in: ["ACTIVE", "COMPLETED"] } } }),
    prisma.courseProgress.aggregate({
      where: { courseId },
      _avg: { overallProgress: true, quizAverage: true },
    }),
  ]);

  return {
    totalStudents: enrollmentCount,
    completionRate: Math.round(moduleProgress._avg.overallProgress ?? 0),
    averageQuizScore: Math.round(moduleProgress._avg.quizAverage ?? 0),
    dropOffRate: Math.max(0, 100 - Math.round(moduleProgress._avg.overallProgress ?? 0)),
    averageWatchMinutes: 0,
  };
}

export async function getAdminModuleDetail(courseId, weekNumber) {
  const week = Number(weekNumber);
  const module = await prisma.module.findUnique({
    where: { courseId_week: { courseId, week } },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  if (!module) return null;

  const content = parseModuleContentMeta(module.contentMeta);
  const firstLesson = module.lessons[0];
  let legacy = { objectives: "", estimatedMinutes: null };
  if (firstLesson?.content) {
    try {
      const parsed = JSON.parse(firstLesson.content);
      legacy.objectives = parsed.objectives ?? content.instructorNotes ? "" : "";
      legacy.estimatedMinutes = parsed.estimatedMinutes ?? null;
    } catch {
      /* ignore */
    }
  }

  if (content.learningOutcomes.length === 0 && firstLesson) {
    content.learningOutcomes = parseLessonTopics(firstLesson.content);
  }

  const analytics = await getModuleAnalytics(courseId, week);

  return {
    moduleId: module.id,
    courseId,
    week: module.week,
    title: module.title,
    description: module.description ?? "",
    objectives: content.learningObjectives || legacy.objectives,
    estimatedMinutes: content.estimatedMinutes ?? legacy.estimatedMinutes,
    status: module.status,
    isReleased: module.isReleased,
    lessons: module.lessons.map(formatLesson),
    content,
    analytics,
  };
}

export function formatModuleCard(module) {
  const content = parseModuleContentMeta(module.contentMeta);
  const lessons = module.lessons ?? [];
  const lessonCount = lessons.length;
  const topicsCount = lessons.reduce((sum, l) => sum + parseLessonTopics(l.content).length, 0);

  return {
    moduleId: module.id,
    week: module.week,
    title: module.title,
    description: module.description ?? "",
    status: module.status,
    isReleased: module.isReleased,
    difficultyLevel: content.difficultyLevel,
    estimatedMinutes: content.estimatedMinutes ?? null,
    lessonCount,
    topicsCount,
    resourceCount: content.resources.length + content.downloads.length,
    videoCount: content.videos.length + lessons.filter((l) => l.videoUrl).length,
    hasQuiz: Boolean(content.quiz?.name),
    hasAssignment: Boolean(content.assignment?.title),
    learningOutcomes: content.learningOutcomes.slice(0, 3),
  };
}

export async function updateAdminModuleDetail(courseId, weekNumber, payload) {
  const week = Number(weekNumber);
  const module = await prisma.module.findUnique({
    where: { courseId_week: { courseId, week } },
    include: { lessons: true },
  });

  if (!module) return null;

  const mergedContent = defaultModuleContentMeta({
    ...(payload.content ?? {}),
    learningObjectives: payload.objectives ?? payload.content?.learningObjectives ?? "",
    estimatedMinutes:
      payload.estimatedMinutes !== undefined
        ? payload.estimatedMinutes
        : payload.content?.estimatedMinutes ?? null,
    difficultyLevel: payload.content?.difficultyLevel ?? "BEGINNER",
  });

  const contentMeta = serializeModuleContentMeta(mergedContent);

  const release = payload.content?.releaseSettings;
  const isReleased =
    payload.isReleased !== undefined
      ? Boolean(payload.isReleased)
      : release?.publishImmediately !== false;

  await prisma.module.update({
    where: { id: module.id },
    data: {
      title: payload.title?.trim() ?? module.title,
      description: payload.description?.trim() ?? "",
      status: payload.status ?? module.status,
      isReleased,
      contentMeta,
    },
  });

  const incomingLessons = Array.isArray(payload.lessons) ? payload.lessons : [];
  const keptIds = new Set(incomingLessons.filter((l) => l.id && !l.id.startsWith("new-")).map((l) => l.id));

  for (const existing of module.lessons) {
    if (!keptIds.has(existing.id)) {
      await prisma.lesson.delete({ where: { id: existing.id } });
    }
  }

  for (let index = 0; index < incomingLessons.length; index += 1) {
    const lesson = incomingLessons[index];
    const order = index + 1;
    const lessonContent = buildLessonContent({
      topics: lesson.topics ?? [],
      description: lesson.description ?? "",
    });
    const enrichedContent = JSON.stringify({
      ...JSON.parse(lessonContent),
      lessonType: lessonTypeFromString(lesson.type),
    });

    if (lesson.id && !lesson.id.startsWith("new-") && keptIds.has(lesson.id)) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          title: lesson.title?.trim() || `Lesson ${order}`,
          description: lesson.description ?? "",
          order,
          duration: lesson.duration ?? null,
          status: lesson.status ?? "ACTIVE",
          videoUrl: lesson.videoUrl ?? null,
          content: enrichedContent,
        },
      });
    } else {
      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: lesson.title?.trim() || `Lesson ${order}`,
          description: lesson.description ?? "",
          slug: `week-${week}-lesson-${order}-${Date.now()}`,
          order,
          duration: lesson.duration ?? null,
          status: lesson.status ?? "DRAFT",
          videoUrl: lesson.videoUrl ?? null,
          content: enrichedContent,
        },
      });
    }
  }

  return getAdminModuleDetail(courseId, week);
}

export async function formatCourseForLms(course, { includeUnreleased = false } = {}) {
  const modules = await prisma.module.findMany({
    where: {
      courseId: course.id,
      ...(includeUnreleased ? {} : { isReleased: true, status: "ACTIVE" }),
    },
    orderBy: { week: "asc" },
    include: { lessons: { orderBy: { order: "asc" }, where: { status: "ACTIVE" } } },
  });

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description ?? "",
    duration: course.duration ?? "",
    level: course.level,
    status: course.status,
    weeks: modules.map((module) => {
      const content = parseModuleContentMeta(module.contentMeta);
      const lessons = module.lessons.map(formatLesson);
      const topics = [
        ...content.learningOutcomes,
        ...lessons.flatMap((l) => l.topics),
      ].filter(Boolean);

      return {
        week: module.week,
        moduleId: module.id,
        title: module.title,
        description: module.description ?? "",
        topics: [...new Set(topics)],
        difficultyLevel: content.difficultyLevel,
        estimatedMinutes: content.estimatedMinutes,
        isReleased: module.isReleased,
        lessons,
        resources: [...content.resources, ...content.downloads],
        videos: content.videos,
        externalLinks: content.externalLinks,
        instructorNotes: content.instructorNotes,
        completionRules: content.completionRules,
        releaseSettings: content.releaseSettings,
        quiz: content.quiz,
        assignment: content.assignment,
      };
    }),
  };
}

export async function formatCourseCardsForAdmin(course) {
  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { week: "asc" },
    include: { lessons: { orderBy: { order: "asc" } } },
  });

  const enrollmentCount = await prisma.enrollment.count({ where: { courseId: course.id } });

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description ?? "",
    duration: course.duration ?? "",
    level: course.level,
    status: course.status,
    enrollmentCount,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    weeks: modules.map(formatModuleCard),
  };
}

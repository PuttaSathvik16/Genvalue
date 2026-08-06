import { prisma } from "../config/database.js";
import {
  defaultModuleContentMeta,
  serializeModuleContentMeta,
} from "./moduleContentMeta.js";

const DEFAULT_COURSE = {
  title: "AI Tools Mastery",
  slug: "ai-tools-mastery",
  description: "Choosing the Right AI Tool for Every Professional Task",
  duration: "12 weeks",
  level: "BEGINNER",
  status: "ACTIVE",
  weeks: [
    {
      week: 1,
      title: "AI Tools Landscape & Selection",
      description: "Understanding different AI tools and when to use them",
      topics: [
        "How foundation models work",
        "Tool categories & accuracy",
        "When general vs specialized tools win",
        "Quick comparison frameworks",
      ],
    },
    {
      week: 2,
      title: "Prompting Fundamentals",
      description: "Master the art of effective prompting",
      topics: [
        "Prompt anatomy",
        "System instructions vs Chain-of-thought",
        "Few-shot examples",
        "Iteration loops",
        "Evaluating output quality",
      ],
    },
    {
      week: 3,
      title: "Research & Synthesis",
      description: "Use AI for research and synthesis tasks",
      topics: [
        "AI-native search",
        "Citations & hallucination checks",
        "Long-document synthesis",
        "Literature review workflows",
      ],
    },
    {
      week: 4,
      title: "Writing & Communications",
      description: "Enhance your writing with AI assistance",
      topics: [
        "Tone & voice control",
        "Long-form structure",
        "Email & deck copy",
        "Light SEO alignment",
        "Editing passes",
      ],
    },
    {
      week: 5,
      title: "Content Analysis & Ideation",
      description: "Analyze content and generate ideas with AI",
      topics: [
        "Extracting insights from data",
        "Brainstorming with AI",
        "Competitor analysis",
        "Trend identification",
        "Audience research",
      ],
    },
    {
      week: 6,
      title: "Code & Technical Tasks",
      description: "Use AI for coding and technical work",
      topics: [
        "Code generation basics",
        "Debugging assistance",
        "Query optimization",
        "API integration",
        "Documentation generation",
      ],
    },
    {
      week: 7,
      title: "Workflow Automation",
      description: "Automate workflows with AI",
      topics: [
        "Workflow orchestration",
        "N8N & Make.com basics",
        "Zapier integration",
        "Scheduling & triggers",
        "Multi-step automation",
      ],
    },
    {
      week: 8,
      title: "Data Processing & Analytics",
      description: "Process and analyze data with AI",
      topics: [
        "Data cleaning & preparation",
        "Pattern recognition",
        "Statistical analysis",
        "Visualization",
        "Report generation",
      ],
    },
    {
      week: 9,
      title: "RAG & Knowledge Bases",
      description: "Build custom AI systems with RAG",
      topics: [
        "Retrieval-Augmented Generation",
        "Vector databases",
        "Knowledge graph creation",
        "Semantic search",
        "Custom AI models",
      ],
    },
    {
      week: 10,
      title: "Agents & Advanced Workflows",
      description: "Create advanced AI agents",
      topics: [
        "AI agents fundamentals",
        "Multi-agent systems",
        "Decision trees",
        "Autonomous workflows",
        "Monitoring & optimization",
      ],
    },
    {
      week: 11,
      title: "Ethics, Privacy & Safety",
      description: "Responsible AI usage",
      topics: [
        "AI ethics & bias",
        "Data privacy",
        "Regulatory compliance",
        "Responsible AI use",
        "Security best practices",
      ],
    },
    {
      week: 12,
      title: "Capstone Project & Career Path",
      description: "Complete your mastery journey",
      topics: [
        "Real-world project",
        "Portfolio building",
        "AI in your industry",
        "Future trends",
        "Career opportunities",
      ],
    },
  ],
};

function buildLessonContent(meta) {
  return JSON.stringify({
    topics: meta.topics ?? [],
    pdfUrl: meta.pdfUrl ?? null,
    objectives: meta.objectives ?? "",
    estimatedMinutes: meta.estimatedMinutes ?? null,
  });
}

function parseLessonContent(content) {
  if (!content) {
    return { topics: [], pdfUrl: null, objectives: "", estimatedMinutes: null };
  }
  try {
    const parsed = JSON.parse(content);
    return {
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      pdfUrl: parsed.pdfUrl ?? null,
      objectives: parsed.objectives ?? "",
      estimatedMinutes: parsed.estimatedMinutes ?? null,
    };
  } catch {
    return { topics: [], pdfUrl: null, objectives: "", estimatedMinutes: null };
  }
}

export function formatModuleAsWeek(module) {
  const lesson = module.lessons?.[0];
  const meta = parseLessonContent(lesson?.content);

  return {
    moduleId: module.id,
    week: module.week,
    title: module.title,
    description: module.description ?? "",
    topics: meta.topics,
    videoUrl: lesson?.videoUrl ?? null,
    pdfUrl: meta.pdfUrl,
    objectives: meta.objectives,
    estimatedMinutes: meta.estimatedMinutes,
    isReleased: module.isReleased,
    status: module.status,
  };
}

export async function formatCourseForAdmin(course) {
  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { week: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, take: 1 },
      _count: { select: { lessons: true } },
    },
  });

  const enrollmentCount = await prisma.enrollment.count({
    where: { courseId: course.id },
  });

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
    weeks: modules.map(formatModuleAsWeek),
  };
}

export async function ensureDefaultCourseCatalog() {
  const existing = await prisma.course.findFirst({
    where: { slug: DEFAULT_COURSE.slug },
  });

  if (existing) {
    const moduleCount = await prisma.module.count({ where: { courseId: existing.id } });
    if (moduleCount >= 12) {
      await backfillModuleContentMeta(existing.id);
      return existing;
    }
  }

  const course =
    existing ??
    (await prisma.course.create({
      data: {
        title: DEFAULT_COURSE.title,
        slug: DEFAULT_COURSE.slug,
        description: DEFAULT_COURSE.description,
        duration: DEFAULT_COURSE.duration,
        level: DEFAULT_COURSE.level,
        status: DEFAULT_COURSE.status,
      },
    }));

  for (const weekData of DEFAULT_COURSE.weeks) {
    const module = await prisma.module.upsert({
      where: {
        courseId_week: { courseId: course.id, week: weekData.week },
      },
      create: {
        courseId: course.id,
        week: weekData.week,
        order: weekData.week,
        title: weekData.title,
        description: weekData.description,
        status: "ACTIVE",
        isReleased: weekData.week <= 12,
      },
      update: {},
    });

    const existingLesson = await prisma.lesson.findFirst({
      where: { moduleId: module.id },
      orderBy: { order: "asc" },
    });

    const content = buildLessonContent({ topics: weekData.topics });

    if (existingLesson) {
      await prisma.lesson.update({
        where: { id: existingLesson.id },
        data: {
          title: `${weekData.title} — Overview`,
          content,
        },
      });
    } else {
      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: `${weekData.title} — Overview`,
          slug: `week-${weekData.week}-overview`,
          order: 1,
          content,
          status: "ACTIVE",
        },
      });
    }

    const refreshed = await prisma.module.findUnique({ where: { id: module.id } });
    if (!refreshed?.contentMeta) {
      await prisma.module.update({
        where: { id: module.id },
        data: {
          contentMeta: serializeModuleContentMeta(
            defaultModuleContentMeta({
              learningOutcomes: weekData.topics,
              learningObjectives: `Master the core concepts of ${weekData.title}.`,
              estimatedMinutes: 90,
              difficultyLevel: weekData.week <= 4 ? "BEGINNER" : weekData.week <= 8 ? "INTERMEDIATE" : "ADVANCED",
            })
          ),
        },
      });
    }
  }

  return course;
}

export { parseLessonContent, buildLessonContent };

async function backfillModuleContentMeta(courseId) {
  const modules = await prisma.module.findMany({
    where: { courseId, contentMeta: null },
    include: { lessons: { orderBy: { order: "asc" }, take: 1 } },
  });

  for (const module of modules) {
    let topics = [];
    try {
      const parsed = JSON.parse(module.lessons[0]?.content ?? "{}");
      topics = Array.isArray(parsed.topics) ? parsed.topics : [];
    } catch {
      topics = [];
    }

    await prisma.module.update({
      where: { id: module.id },
      data: {
        contentMeta: serializeModuleContentMeta(
          defaultModuleContentMeta({
            learningOutcomes: topics,
            learningObjectives: `Master the core concepts of ${module.title}.`,
            estimatedMinutes: 90,
          })
        ),
      },
    });
  }
}

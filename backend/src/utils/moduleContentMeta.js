import crypto from "crypto";

export const DEFAULT_COMPLETION_RULES = {
  watchAllVideos: true,
  readNotes: false,
  downloadResources: false,
  completeAssignment: false,
  passQuiz: false,
};

export const DEFAULT_RELEASE_SETTINGS = {
  publishImmediately: true,
  scheduledAt: null,
  dripContent: false,
  prerequisiteWeek: null,
};

export function createId(prefix = "item") {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function defaultModuleContentMeta(overrides = {}) {
  return {
    learningObjectives: "",
    estimatedMinutes: null,
    learningOutcomes: [],
    difficultyLevel: "BEGINNER",
    instructorNotes: "",
    resources: [],
    videos: [],
    images: [],
    codeExamples: [],
    externalLinks: [],
    downloads: [],
    completionRules: { ...DEFAULT_COMPLETION_RULES },
    releaseSettings: { ...DEFAULT_RELEASE_SETTINGS },
    quiz: null,
    assignment: null,
    ...overrides,
  };
}

export function parseModuleContentMeta(raw) {
  if (!raw) return defaultModuleContentMeta();
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return defaultModuleContentMeta(parsed);
  } catch {
    return defaultModuleContentMeta();
  }
}

export function serializeModuleContentMeta(meta) {
  return JSON.stringify(defaultModuleContentMeta(meta));
}

export function parseLessonTopics(content) {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.topics) ? parsed.topics : [];
  } catch {
    return [];
  }
}

export function buildLessonContent({ topics = [], description = "" }) {
  return JSON.stringify({ topics, description });
}

export function lessonTypeFromString(value) {
  const normalized = String(value ?? "VIDEO").toUpperCase();
  if (["VIDEO", "READING", "LIVE", "LAB"].includes(normalized)) return normalized;
  return "VIDEO";
}

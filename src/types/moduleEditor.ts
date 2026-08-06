export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type ModuleStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type LessonType = "VIDEO" | "READING" | "LIVE" | "LAB";
export type LessonStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface ModuleResource {
  id: string;
  name: string;
  type: "PDF" | "PPT" | "DOCX" | "ZIP" | "NOTEBOOK" | "XLSX" | "TXT" | "CSV" | "MD";
  fileUrl: string;
  externalUrl: string;
  downloadable: boolean;
}

export interface ModuleVideo {
  id: string;
  title: string;
  fileUrl: string;
  externalUrl: string;
  thumbnailUrl: string;
  durationMinutes: number | null;
  captionsUrl: string;
  previewEnabled: boolean;
}

export interface ModuleImage {
  id: string;
  title: string;
  caption: string;
  altText: string;
  fileUrl: string;
}

export interface CodeExample {
  id: string;
  title: string;
  language: "PYTHON" | "JAVASCRIPT" | "TYPESCRIPT" | "SQL" | "BASH";
  code: string;
}

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  description: string;
}

export interface ModuleQuiz {
  name: string;
  passingPercentage: number;
  timeLimitMinutes: number | null;
  attemptsAllowed: number;
}

export interface ModuleAssignment {
  title: string;
  description: string;
  deadline: string | null;
  maximumMarks: number;
  submissionType: "FILE" | "TEXT" | "URL";
}

export interface CompletionRules {
  watchAllVideos: boolean;
  readNotes: boolean;
  downloadResources: boolean;
  completeAssignment: boolean;
  passQuiz: boolean;
}

export interface ReleaseSettings {
  publishImmediately: boolean;
  scheduledAt: string | null;
  dripContent: boolean;
  prerequisiteWeek: number | null;
}

export interface ModuleContentMeta {
  learningObjectives: string;
  estimatedMinutes: number | null;
  learningOutcomes: string[];
  difficultyLevel: DifficultyLevel;
  instructorNotes: string;
  resources: ModuleResource[];
  videos: ModuleVideo[];
  images: ModuleImage[];
  codeExamples: CodeExample[];
  externalLinks: ExternalLink[];
  downloads: ModuleResource[];
  completionRules: CompletionRules;
  releaseSettings: ReleaseSettings;
  quiz: ModuleQuiz | null;
  assignment: ModuleAssignment | null;
}

export interface ModuleLesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  duration: number | null;
  status: LessonStatus;
  order: number;
  videoUrl: string | null;
  topics: string[];
}

export interface ModuleAnalytics {
  totalStudents: number;
  completionRate: number;
  averageQuizScore: number;
  dropOffRate: number;
  averageWatchMinutes: number;
}

export interface AdminModuleDetail {
  moduleId: string;
  courseId: string;
  week: number;
  title: string;
  description: string;
  objectives: string;
  estimatedMinutes: number | null;
  status: ModuleStatus;
  isReleased: boolean;
  lessons: ModuleLesson[];
  content: ModuleContentMeta;
  analytics: ModuleAnalytics;
}

export interface AdminModuleWeekCard {
  moduleId: string;
  week: number;
  title: string;
  description: string;
  status: ModuleStatus;
  isReleased: boolean;
  difficultyLevel: DifficultyLevel;
  estimatedMinutes: number | null;
  lessonCount: number;
  topicsCount: number;
  resourceCount: number;
  videoCount: number;
  hasQuiz: boolean;
  hasAssignment: boolean;
  learningOutcomes: string[];
}

export type ModuleEditorTab =
  | "general"
  | "lessons"
  | "resources"
  | "videos"
  | "notes"
  | "assignments"
  | "quiz"
  | "settings"
  | "preview";

export function createEmptyModuleContent(): ModuleContentMeta {
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
    completionRules: {
      watchAllVideos: true,
      readNotes: false,
      downloadResources: false,
      completeAssignment: false,
      passQuiz: false,
    },
    releaseSettings: {
      publishImmediately: true,
      scheduledAt: null,
      dripContent: false,
      prerequisiteWeek: null,
    },
    quiz: null,
    assignment: null,
  };
}

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

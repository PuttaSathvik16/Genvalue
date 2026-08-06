import { course as courseData } from "@/data/course";

export type Role = "SUPER_ADMIN" | "ADMIN" | "INSTRUCTOR" | "STUDENT";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  image?: string;
  bio?: string;
  skills?: string;
  createdAt: string;
};

export type CourseModule = {
  id: string;
  title: string;
  week: number;
  description: string;
  lessons: Lesson[];
  quiz?: Quiz;
  assignment?: Assignment;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: "VIDEO" | "READING" | "PDF" | "LIVE";
  videoUrl?: string;
  pdfUrl?: string;
  duration: string;
  resources?: { title: string; url: string; type: string }[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  points: number;
};

export type Quiz = {
  id: string;
  moduleId: string;
  title: string;
  passScore: number;
  timeLimit: number; // minutes
  questions: QuizQuestion[];
};

export type Assignment = {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  deadline: string;
  maxPoints: number;
};

export type AssignmentSubmission = {
  id: string;
  assignmentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  fileUrl?: string;
  status: "PENDING" | "GRADED" | "REJECTED";
  points?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
};

export type Certificate = {
  id: string;
  certificateId: string;
  userId: string;
  userName: string;
  courseTitle: string;
  issuedAt: string;
  pdfUrl?: string;
  qrCodeUrl?: string;
};

export type StudentProgress = {
  userId: string;
  courseId: string;
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  assignmentStatus: Record<string, "PENDING" | "GRADED" | "REJECTED">;
  overallProgress: number; // 0 to 100
};

export type AuditLog = {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
};

// Initial Demo Seed Users (Standard Gmail IDs as requested)
export const INITIAL_USERS: User[] = [
  {
    id: "u-superadmin",
    name: "Sathvik Putta (Super Admin)",
    email: "superadmin@gmail.com",
    role: "SUPER_ADMIN",
    image: "/images/poster/genvalue-poster.png",
    bio: "Founder & Lead Instructor at GenValue.",
    skills: "AI Architecture, LLMs, Automation, Multi-Agent Systems",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "u-admin",
    name: "Administrator",
    email: "admin@gmail.com",
    role: "ADMIN",
    bio: "Managing Operations & Student Success at GenValue.",
    skills: "LMS Admin, Analytics, Student Management",
    createdAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "u-instructor",
    name: "Lead Faculty Instructor",
    email: "instructor@gmail.com",
    role: "INSTRUCTOR",
    bio: "Practitioner teaching hands-on AI tools every week.",
    skills: "Prompt Engineering, Cursor AI, Midjourney, Claude 3.5",
    createdAt: "2026-01-10T00:00:00.000Z",
  },
  {
    id: "u-student",
    name: "Rahul Verma (Student)",
    email: "student@gmail.com",
    role: "STUDENT",
    bio: "Enrolled in AI Tools Mastery 12-Week Program.",
    skills: "Full-Stack Web Dev, Learning AI Automation",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
];

// Seed 12-Week Curriculum Modules & Lessons from Course Data
export function generateCourseModules(): CourseModule[] {
  return courseData.syllabus.map((weekData) => {
    const moduleId = `mod-w${weekData.week}`;
    const lessons: Lesson[] = [
      {
        id: `les-w${weekData.week}-1`,
        moduleId,
        title: `Week ${weekData.week} Core Overview: ${weekData.topic}`,
        description: weekData.concepts,
        type: "VIDEO",
        videoUrl: "/videos/genvalue-academy-promo.mp4",
        duration: "35 mins",
        resources: [
          {
            title: `Week ${weekData.week} Cheatsheet & Guide PDF`,
            url: "/downloads/genvalue-syllabus.pdf",
            type: "PDF",
          },
        ],
      },
      {
        id: `les-w${weekData.week}-2`,
        moduleId,
        title: `Hands-On Lab: ${weekData.topic}`,
        description: `Step-by-step practical assignment applying ${weekData.concepts.split('·').slice(0, 2).join(' & ')}.`,
        type: "VIDEO",
        videoUrl: "/videos/genvalue-academy-promo.mp4",
        duration: "45 mins",
      },
      {
        id: `les-w${weekData.week}-3`,
        moduleId,
        title: `Reference Reading & Tool Best Practices`,
        description: `Official documentation notes, prompt templates, and evaluation framework for Week ${weekData.week}.`,
        type: "READING",
        pdfUrl: "/downloads/genvalue-syllabus.pdf",
        duration: "20 mins",
      },
    ];

    const quiz: Quiz = {
      id: `quiz-w${weekData.week}`,
      moduleId,
      title: `Week ${weekData.week} Assessment: ${weekData.topic}`,
      passScore: 70,
      timeLimit: 15,
      questions: [
        {
          id: `q-w${weekData.week}-1`,
          question: `What is the primary objective when evaluating tools in Week ${weekData.week} (${weekData.topic})?`,
          options: [
            "Understanding trade-offs and choosing judgment over hype",
            "Memorizing release notes for every model update",
            "Using only one default assistant for all tasks",
            "Ignoring data privacy and context limits",
          ],
          correctAnswer: "Understanding trade-offs and choosing judgment over hype",
          points: 10,
        },
        {
          id: `q-w${weekData.week}-2`,
          question: `Which key topic is emphasized in Week ${weekData.week}?`,
          options: [
            weekData.topic,
            "Legacy Manual Spreadsheet Operations",
            "Non-interactive static slide decks",
            "Random unverified prompt copying",
          ],
          correctAnswer: weekData.topic,
          points: 10,
        },
      ],
    };

    const assignment: Assignment = {
      id: `assign-w${weekData.week}`,
      moduleId,
      title: `Week ${weekData.week} Submission: ${weekData.assignment}`,
      description: `Complete your practical submission for ${weekData.assignment}. Submit a PDF report, ZIP build, or live project link.`,
      deadline: `Week ${weekData.week} Sunday, 11:59 PM`,
      maxPoints: 100,
    };

    return {
      id: moduleId,
      week: weekData.week,
      title: `Week ${weekData.week}: ${weekData.topic}`,
      description: weekData.concepts,
      lessons,
      quiz,
      assignment,
    };
  });
}

// In-Memory LMS State Singleton
class LMSStore {
  private users: User[] = [...INITIAL_USERS];
  private modules: CourseModule[] = generateCourseModules();
  private submissions: AssignmentSubmission[] = [
    {
      id: "sub-1",
      assignmentId: "assign-w1",
      userId: "u-student",
      userName: "Rahul Verma (Student)",
      userEmail: "student@gmail.com",
      content: "Completed Week 1 AI Tool Audit Matrix & Comparison Report.",
      fileUrl: "/downloads/genvalue-syllabus.pdf",
      status: "GRADED",
      points: 95,
      feedback: "Excellent work! Clear model comparison matrix and structured trade-off evaluation.",
      submittedAt: "2026-02-10T14:30:00.000Z",
      gradedAt: "2026-02-11T09:15:00.000Z",
    },
    {
      id: "sub-2",
      assignmentId: "assign-w2",
      userId: "u-student",
      userName: "Rahul Verma (Student)",
      userEmail: "student@gmail.com",
      content: "Submitted Advanced Prompt Engineering & System Persona Lab project.",
      fileUrl: "/downloads/genvalue-syllabus.pdf",
      status: "PENDING",
      submittedAt: "2026-02-18T18:45:00.000Z",
    },
  ];

  private quizAttempts: QuizAttempt[] = [
    {
      id: "qa-1",
      quizId: "quiz-w1",
      userId: "u-student",
      score: 100,
      passed: true,
      attemptedAt: "2026-02-10T15:00:00.000Z",
    },
  ];

  private certificates: Certificate[] = [
    {
      id: "cert-1",
      certificateId: "GV-2026-AI-88492",
      userId: "u-student",
      userName: "Rahul Verma",
      courseTitle: "AI Tools Mastery (12-Week Program)",
      issuedAt: "2026-02-20T10:00:00.000Z",
      pdfUrl: "/downloads/genvalue-syllabus.pdf",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GV-2026-AI-88492",
    },
  ];

  private progress: Record<string, StudentProgress> = {
    "u-student": {
      userId: "u-student",
      courseId: "ai-tools-mastery",
      completedLessonIds: ["les-w1-1", "les-w1-2", "les-w1-3", "les-w2-1", "les-w2-2"],
      quizScores: { "quiz-w1": 100 },
      assignmentStatus: { "assign-w1": "GRADED", "assign-w2": "PENDING" },
      overallProgress: 42,
    },
  };

  private auditLogs: AuditLog[] = [
    {
      id: "log-1",
      userId: "u-student",
      userName: "Rahul Verma",
      action: "QUIZ_SUBMITTED",
      details: "Scored 100% on Week 1 Assessment",
      ipAddress: "127.0.0.1",
      timestamp: "2026-02-10T15:00:00.000Z",
    },
    {
      id: "log-2",
      userId: "u-instructor",
      userName: "Lead Instructor",
      action: "ASSIGNMENT_GRADED",
      details: "Graded Rahul Verma (95/100) on Week 1 Submission",
      ipAddress: "127.0.0.1",
      timestamp: "2026-02-11T09:15:00.000Z",
    },
  ];

  // User Management
  getUsers() {
    return this.users;
  }

  getUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  addUser(user: User) {
    this.users.push(user);
    this.addAuditLog(user.id, user.name, "USER_REGISTERED", `New user registered with role ${user.role}`);
    return user;
  }

  // Course & Modules
  getModules() {
    return this.modules;
  }

  getModuleById(id: string) {
    return this.modules.find((m) => m.id === id);
  }

  getLessonById(lessonId: string) {
    for (const mod of this.modules) {
      const found = mod.lessons.find((l) => l.id === lessonId);
      if (found) return { lesson: found, module: mod };
    }
    return null;
  }

  // Progress Tracking
  getStudentProgress(userId: string): StudentProgress {
    if (!this.progress[userId]) {
      this.progress[userId] = {
        userId,
        courseId: "ai-tools-mastery",
        completedLessonIds: [],
        quizScores: {},
        assignmentStatus: {},
        overallProgress: 0,
      };
    }
    return this.progress[userId];
  }

  markLessonComplete(userId: string, lessonId: string) {
    const prog = this.getStudentProgress(userId);
    if (!prog.completedLessonIds.includes(lessonId)) {
      prog.completedLessonIds.push(lessonId);
      const totalLessons = this.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      prog.overallProgress = Math.min(100, Math.round((prog.completedLessonIds.length / totalLessons) * 100));
      this.addAuditLog(userId, userId, "LESSON_COMPLETED", `Completed lesson ${lessonId}`);
    }
    return prog;
  }

  // Submissions & Grading
  getSubmissions() {
    return this.submissions;
  }

  submitAssignment(submission: Omit<AssignmentSubmission, "id" | "submittedAt" | "status">) {
    const newSub: AssignmentSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };
    this.submissions.unshift(newSub);
    const prog = this.getStudentProgress(submission.userId);
    prog.assignmentStatus[submission.assignmentId] = "PENDING";
    this.addAuditLog(submission.userId, submission.userName, "ASSIGNMENT_SUBMITTED", `Submitted assignment ${submission.assignmentId}`);
    return newSub;
  }

  gradeAssignment(submissionId: string, points: number, feedback: string, instructorId: string) {
    const sub = this.submissions.find((s) => s.id === submissionId);
    if (!sub) return null;
    sub.status = "GRADED";
    sub.points = points;
    sub.feedback = feedback;
    sub.gradedAt = new Date().toISOString();
    const prog = this.getStudentProgress(sub.userId);
    prog.assignmentStatus[sub.assignmentId] = "GRADED";
    this.addAuditLog(instructorId, "Instructor", "ASSIGNMENT_GRADED", `Graded ${sub.userName} (${points}/100)`);
    return sub;
  }

  // Quizzes
  submitQuizAttempt(userId: string, quizId: string, score: number) {
    const passed = score >= 70;
    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      quizId,
      userId,
      score,
      passed,
      attemptedAt: new Date().toISOString(),
    };
    this.quizAttempts.unshift(attempt);
    const prog = this.getStudentProgress(userId);
    prog.quizScores[quizId] = score;
    this.addAuditLog(userId, userId, "QUIZ_SUBMITTED", `Completed quiz ${quizId} with score ${score}%`);
    return attempt;
  }

  getQuizAttempts(userId: string) {
    return this.quizAttempts.filter((q) => q.userId === userId);
  }

  // Certificates
  getCertificates(userId: string) {
    return this.certificates.filter((c) => c.userId === userId);
  }

  generateCertificate(userId: string, userName: string) {
    const existing = this.certificates.find((c) => c.userId === userId);
    if (existing) return existing;
    const certId = `GV-${new Date().getFullYear()}-AI-${Math.floor(10000 + Math.random() * 90000)}`;
    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateId: certId,
      userId,
      userName,
      courseTitle: "AI Tools Mastery (12-Week Program)",
      issuedAt: new Date().toISOString(),
      pdfUrl: "/downloads/genvalue-syllabus.pdf",
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${certId}`,
    };
    this.certificates.push(newCert);
    this.addAuditLog(userId, userName, "CERTIFICATE_GENERATED", `Issued certificate ${certId}`);
    return newCert;
  }

  // Audit Logs
  getAuditLogs() {
    return this.auditLogs;
  }

  addAuditLog(userId: string, userName: string, action: string, details: string) {
    this.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId,
      userName,
      action,
      details,
      ipAddress: "127.0.0.1",
      timestamp: new Date().toISOString(),
    });
  }
}

export const lmsStore = new LMSStore();

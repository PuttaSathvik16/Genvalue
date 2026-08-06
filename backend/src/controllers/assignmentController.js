import { prisma } from "../config/database.js";
import { hasStaffAccess } from "../middleware/auth.js";
import { calculateQuizScorePercent } from "../utils/quizQuestionUtils.js";
import { sanitizeHttpUrl, sanitizeText } from "../utils/inputValidation.js";

function parseJson(value, fallback = null) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function enrichSubmissionRecord(submission) {
  const assignment = submission.assignment;
  const questions = assignment?.questions ? parseJson(assignment.questions, []) : [];
  const answers = submission.answers ? parseJson(submission.answers, []) : null;

  let quizScore = submission.quizScore;
  if (quizScore == null && answers && questions.length > 0) {
    quizScore = calculateQuizScorePercent(answers, questions);
  }

  const needsManualReview =
    submission.status === "SUBMITTED" &&
    (submission.submissionType === "PDF" || submission.submissionType === "MIXED");

  const safeAssignment = assignment
    ? {
        id: assignment.id,
        week: assignment.week,
        title: assignment.title,
        type: assignment.type,
        passingScore: assignment.passingScore,
        questionCount: questions.length,
      }
    : null;

  return {
    ...submission,
    assignment: safeAssignment,
    quizScore,
    needsManualReview,
    answers,
  };
}

/**
 * Get all assignments (admin)
 */
export const getAllAssignments = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can view all assignments",
      });
    }

    // Fetch all assignments
    const assignments = await prisma.assignment.findMany({
      orderBy: [{ week: "asc" }, { createdAt: "desc" }],
      include: {
        submissions: {
          select: {
            id: true,
            userId: true,
            status: true,
            grade: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

/**
 * Get assignments for a specific week (student)
 */
export const getWeekAssignments = async (req, res) => {
  try {
    const { week } = req.params;

    if (!week || isNaN(week)) {
      return res.status(400).json({
        success: false,
        message: "Valid week number is required",
      });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        week: parseInt(week),
        status: "ACTIVE",
      },
      select: {
        id: true,
        week: true,
        title: true,
        description: true,
        instructions: true,
        type: true,
        isRequired: true,
        questions: true,
        passingScore: true,
        dueDate: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("Get week assignments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

/**
 * Create a new assignment (admin)
 */
export const createAssignment = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can create assignments",
      });
    }

    const {
      week,
      title,
      description,
      instructions,
      type,
      isRequired,
      questions,
      passingScore,
      dueDate,
    } = req.body;

    if (!week || !title || !type || !dueDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: week, title, type, dueDate",
      });
    }

    if ((type === "MCQ" || type === "MIXED") && (!Array.isArray(questions) || questions.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "MCQ and mixed assignments require at least one question",
      });
    }

    const newAssignment = await prisma.assignment.create({
      data: {
        week: parseInt(week),
        title,
        description,
        instructions,
        type,
        isRequired: isRequired !== false,
        questions:
          type === "MCQ" || type === "MIXED"
            ? JSON.stringify(questions)
            : null,
        passingScore:
          type === "MCQ" || type === "MIXED"
            ? parseInt(passingScore ?? 70, 10)
            : null,
        dueDate: new Date(dueDate),
      },
    });

    res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: newAssignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create assignment",
      error: error.message,
    });
  }
};

/**
 * Update an assignment (admin)
 */
export const updateAssignment = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can update assignments",
      });
    }

    const { assignmentId } = req.params;
    const {
      week,
      title,
      description,
      instructions,
      type,
      isRequired,
      questions,
      passingScore,
      dueDate,
      status,
    } = req.body;

    const resolvedType = type;
    if (
      (resolvedType === "MCQ" || resolvedType === "MIXED") &&
      questions !== undefined &&
      (!Array.isArray(questions) || questions.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "MCQ and mixed assignments require at least one question",
      });
    }

    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(week !== undefined && { week: parseInt(week, 10) }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(type !== undefined && { type }),
        ...(isRequired !== undefined && { isRequired }),
        ...(questions !== undefined && {
          questions:
            resolvedType === "PDF"
              ? null
              : Array.isArray(questions)
                ? JSON.stringify(questions)
                : null,
        }),
        ...(passingScore !== undefined && {
          passingScore:
            resolvedType === "PDF" ? null : parseInt(passingScore, 10),
        }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(status !== undefined && { status }),
      },
      include: {
        submissions: {
          select: {
            id: true,
            userId: true,
            status: true,
            grade: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

/**
 * Delete an assignment (admin)
 */
export const deleteAssignment = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can delete assignments",
      });
    }

    const { assignmentId } = req.params;

    await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    res.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to delete assignment",
      error: error.message,
    });
  }
};

/**
 * Submit an assignment (student)
 */
export const submitAssignment = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { assignmentId, type, pdfUrl: rawPdfUrl, answers } = req.body;

    if (!assignmentId || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: assignmentId, type",
      });
    }

    const submissionType = sanitizeText(type, 20).toUpperCase();
    if (!["PDF", "MCQ", "MIXED"].includes(submissionType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid submission type",
      });
    }

    let pdfUrl = null;
    if (submissionType === "PDF" || submissionType === "MIXED") {
      pdfUrl = sanitizeHttpUrl(rawPdfUrl);
      if (!pdfUrl) {
        return res.status(400).json({
          success: false,
          message: "A valid HTTP(S) PDF URL is required",
        });
      }
    }

    // Get assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    // Check if submission already exists
    let submission = await prisma.assignmentSubmission.findUnique({
      where: {
        userId_assignmentId: {
          userId,
          assignmentId,
        },
      },
    });

    if (submission) {
      // Update existing submission
      submission = await prisma.assignmentSubmission.update({
        where: {
          userId_assignmentId: {
            userId,
            assignmentId,
          },
        },
        data: {
          submissionType: submissionType,
          ...(submissionType === "PDF" || submissionType === "MIXED") && pdfUrl && { pdfUrl },
          ...(submissionType === "MCQ" || submissionType === "MIXED") && answers && { answers: JSON.stringify(answers) },
          submittedAt: new Date(),
          status: "SUBMITTED",
        },
      });
    } else {
      // Create new submission
      submission = await prisma.assignmentSubmission.create({
        data: {
          userId,
          assignmentId,
          submissionType: submissionType,
          pdfUrl: (submissionType === "PDF" || submissionType === "MIXED") ? pdfUrl : null,
          answers: (submissionType === "MCQ" || submissionType === "MIXED") ? JSON.stringify(answers) : null,
          submittedAt: new Date(),
          status: "SUBMITTED",
        },
      });
    }

    // Auto-score MCQ portions
    if ((submissionType === "MCQ" || submissionType === "MIXED") && answers) {
      const questions = assignment.questions ? JSON.parse(assignment.questions) : [];
      const quizScore = calculateQuizScorePercent(answers, questions);

      if (submissionType === "MCQ") {
        submission = await prisma.assignmentSubmission.update({
          where: { id: submission.id },
          data: {
            quizScore,
            grade: quizScore,
            status: "GRADED",
            gradedAt: new Date(),
          },
        });
      } else {
        // MIXED: quiz auto-graded; PDF still needs instructor review
        submission = await prisma.assignmentSubmission.update({
          where: { id: submission.id },
          data: {
            quizScore,
            status: "SUBMITTED",
            grade: null,
            gradedAt: null,
          },
        });
      }
    }

    res.json({
      success: true,
      message: "Assignment submitted successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit assignment",
      error: error.message,
    });
  }
};

/**
 * Get student submissions for an assignment (admin)
 */
export const getAssignmentSubmissions = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can view submissions",
      });
    }

    const { assignmentId } = req.params;

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { assignmentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        assignment: {
          select: {
            id: true,
            week: true,
            title: true,
            type: true,
            passingScore: true,
            questions: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    res.json({
      success: true,
      data: submissions.map(enrichSubmissionRecord),
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

/**
 * List all assignment submissions (admin) with filters and pagination
 */
export const getAllSubmissions = async (req, res) => {
  try {
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can view submissions",
      });
    }

    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize ?? "20", 10)));
    const { week, status, type, search, needsReview } = req.query;

    const where = {};

    if (week && !Number.isNaN(parseInt(week, 10))) {
      where.assignment = { week: parseInt(week, 10) };
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.submissionType = type;
    }

    if (needsReview === "true") {
      where.status = "SUBMITTED";
      where.submissionType = { in: ["PDF", "MIXED"] };
    }

    if (search?.trim()) {
      const term = search.trim();
      where.user = {
        OR: [
          { email: { contains: term, mode: "insensitive" } },
          { name: { contains: term, mode: "insensitive" } },
        ],
      };
    }

    const [total, submissions] = await Promise.all([
      prisma.assignmentSubmission.count({ where }),
      prisma.assignmentSubmission.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          assignment: {
            select: {
              id: true,
              week: true,
              title: true,
              type: true,
              passingScore: true,
              questions: true,
            },
          },
        },
        orderBy: [{ submittedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    res.json({
      success: true,
      data: submissions.map(enrichSubmissionRecord),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error("Get all submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

/**
 * Grade an assignment submission (admin/instructor)
 */
export const gradeSubmission = async (req, res) => {
  try {
    // Check if user is admin/instructor
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can grade submissions",
      });
    }

    const { submissionId } = req.params;
    const { grade, feedback: rawFeedback } = req.body;
    const feedback = rawFeedback != null ? sanitizeText(rawFeedback, 2000) : undefined;

    if (grade === undefined) {
      return res.status(400).json({
        success: false,
        message: "Grade is required",
      });
    }

    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: parseInt(grade),
        feedback,
        status: "GRADED",
        gradedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: "Submission graded successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Grade submission error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to grade submission",
      error: error.message,
    });
  }
};

/**
 * Get user's assignment submissions (student)
 */
export const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.user.uid;

    const submissions = await prisma.assignmentSubmission.findMany({
      where: { userId },
      include: {
        assignment: {
          select: {
            id: true,
            week: true,
            title: true,
            type: true,
            dueDate: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    res.json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    console.error("Get user submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

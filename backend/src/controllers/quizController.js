import { prisma } from "../config/database.js";
import { hasStaffAccess } from "../middleware/auth.js";
import {
  scoreQuestionAnswer,
  validateQuizQuestions,
} from "../utils/quizQuestionUtils.js";

// Mock quiz storage (will be replaced with database)
let mockQuizzes = [];

function parseQuestions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Get all quizzes (public for students)
 */
export const getAllQuizzesPublic = async (req, res) => {
  try {
    res.json({
      success: true,
      data: mockQuizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
      error: error.message,
    });
  }
};

/**
 * Get all quizzes (admin)
 */
export const getAllQuizzes = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can view all quizzes",
      });
    }

    res.json({
      success: true,
      data: mockQuizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
      error: error.message,
    });
  }
};

/**
 * Get a specific quiz
 */
export const getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    const quiz = mockQuizzes.find((q) => q.id === quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz",
      error: error.message,
    });
  }
};

/**
 * Get quizzes for a specific week
 */
export const getWeekQuiz = async (req, res) => {
  try {
    const { week } = req.params;

    if (!week) {
      return res.status(400).json({
        success: false,
        message: "Week number is required",
      });
    }

    const quiz = mockQuizzes.find((q) => q.week === parseInt(week));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "No quiz found for this week",
      });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Get week quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz",
      error: error.message,
    });
  }
};

/**
 * Create a new quiz
 */
export const createQuiz = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can create quizzes",
      });
    }

    const { week, title, description, duration, passingScore, questions } = req.body;

    if (!week || !title || !description || !duration || !passingScore) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: week, title, description, duration, passingScore",
      });
    }

    const parsedQuestions = parseQuestions(questions);
    const validationError = validateQuizQuestions(parsedQuestions);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    // Check if quiz already exists for this week
    if (mockQuizzes.some((q) => q.week === week)) {
      return res.status(400).json({
        success: false,
        message: `Quiz already exists for week ${week}`,
      });
    }

    const newQuiz = {
      id: `quiz-${Date.now()}`,
      week: parseInt(week),
      title,
      description,
      duration: parseInt(duration),
      passingScore: parseInt(passingScore),
      questions: parsedQuestions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockQuizzes.push(newQuiz);

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: newQuiz,
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quiz",
      error: error.message,
    });
  }
};

/**
 * Update a quiz
 */
export const updateQuiz = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can update quizzes",
      });
    }

    const { quizId } = req.params;
    const { week, title, description, duration, passingScore, questions } = req.body;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    const quizIndex = mockQuizzes.findIndex((q) => q.id === quizId);

    if (quizIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    if (questions !== undefined) {
      const parsedQuestions = parseQuestions(questions);
      const validationError = validateQuizQuestions(parsedQuestions);
      if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
      }
    }

    // Check if another quiz exists for the new week
    if (week && week !== mockQuizzes[quizIndex].week) {
      if (mockQuizzes.some((q) => q.week === week && q.id !== quizId)) {
        return res.status(400).json({
          success: false,
          message: `Quiz already exists for week ${week}`,
        });
      }
    }

    const updatedQuiz = {
      ...mockQuizzes[quizIndex],
      week: week !== undefined ? parseInt(week) : mockQuizzes[quizIndex].week,
      title: title || mockQuizzes[quizIndex].title,
      description: description || mockQuizzes[quizIndex].description,
      duration: duration !== undefined ? parseInt(duration) : mockQuizzes[quizIndex].duration,
      passingScore: passingScore !== undefined ? parseInt(passingScore) : mockQuizzes[quizIndex].passingScore,
      questions:
        questions !== undefined ? parseQuestions(questions) : mockQuizzes[quizIndex].questions,
      updatedAt: new Date(),
    };

    mockQuizzes[quizIndex] = updatedQuiz;

    res.json({
      success: true,
      message: "Quiz updated successfully",
      data: updatedQuiz,
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quiz",
      error: error.message,
    });
  }
};

/**
 * Delete a quiz
 */
export const deleteQuiz = async (req, res) => {
  try {
    // Check if user is admin
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can delete quizzes",
      });
    }

    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: "Quiz ID is required",
      });
    }

    const quizIndex = mockQuizzes.findIndex((q) => q.id === quizId);

    if (quizIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    mockQuizzes.splice(quizIndex, 1);

    res.json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
      error: error.message,
    });
  }
};

/**
 * Submit quiz attempt and get score
 */
export const submitQuizAttempt = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { quizId, answers } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: quizId, answers",
      });
    }

    const quiz = mockQuizzes.find((q) => q.id === quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;

    quiz.questions.forEach((question, idx) => {
      totalPoints += question.points;

      if (scoreQuestionAnswer(answers[idx], question)) {
        correctAnswers += question.points;
      }
    });

    const scorePercentage = Math.round((correctAnswers / totalPoints) * 100);
    const passed = scorePercentage >= quiz.passingScore;

    // TODO: Store attempt in database
    const attempt = {
      id: `attempt-${Date.now()}`,
      userId,
      quizId,
      week: quiz.week,
      score: scorePercentage,
      passed,
      answers,
      submittedAt: new Date(),
    };

    res.json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        ...attempt,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          passingScore: quiz.passingScore,
        },
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
      error: error.message,
    });
  }
};

/**
 * Get quiz attempts for a user
 */
export const getUserQuizAttempts = async (req, res) => {
  try {
    const userId = req.user.uid;

    // TODO: Fetch from database
    // For now return empty array
    const attempts = [];

    res.json({
      success: true,
      data: attempts,
    });
  } catch (error) {
    console.error("Get attempts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch attempts",
      error: error.message,
    });
  }
};

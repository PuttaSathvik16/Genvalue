import express from "express";
import {
  getAllQuizzesPublic,
  getAllQuizzes,
  getQuiz,
  getWeekQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getUserQuizAttempts,
} from "../controllers/quizController.js";
import { verifyToken, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/admin/quizzes", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), getAllQuizzes);
router.post("/admin/quizzes", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), createQuiz);
router.get("/admin/quizzes/:quizId", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), getQuiz);
router.put("/admin/quizzes/:quizId", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), updateQuiz);
router.delete("/admin/quizzes/:quizId", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), deleteQuiz);

// Student/Public routes
router.get("/quizzes", verifyToken, getAllQuizzesPublic);
router.get("/quizzes/week/:week", verifyToken, getWeekQuiz);
router.get("/quizzes/:quizId", verifyToken, getQuiz);
router.post("/quizzes/:quizId/submit", verifyToken, submitQuizAttempt);
router.get("/user/quiz-attempts", verifyToken, getUserQuizAttempts);

export default router;

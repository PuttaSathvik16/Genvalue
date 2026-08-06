import express from "express";
import {
  getAllAssignments,
  getWeekAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAllSubmissions,
  getAssignmentSubmissions,
  gradeSubmission,
  getUserSubmissions,
} from "../controllers/assignmentController.js";
import { verifyToken, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/admin/assignments", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), getAllAssignments);
router.post("/admin/assignments", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), createAssignment);
router.put("/admin/assignments/:assignmentId", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), updateAssignment);
router.delete("/admin/assignments/:assignmentId", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), deleteAssignment);
router.get("/admin/submissions", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), getAllSubmissions);
router.get("/admin/assignments/:assignmentId/submissions", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), getAssignmentSubmissions);
router.put("/admin/submissions/:submissionId/grade", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), gradeSubmission);

// Student routes
router.get("/assignments/week/:week", verifyToken, getWeekAssignments);
router.post("/assignments/:assignmentId/submit", verifyToken, submitAssignment);
router.get("/user/submissions", verifyToken, getUserSubmissions);

export default router;

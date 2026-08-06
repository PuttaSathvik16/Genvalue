import express from "express";
import {
  getAllCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseWeek,
  getAdminModule,
  updateAdminModule,
  getLmsCourse,
} from "../controllers/courseController.js";
import { verifyToken, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Admin routes
router.get("/admin/courses", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), getAllCourses);
router.post("/admin/courses", verifyToken, checkRole(["ADMIN"]), createCourse);
router.get("/admin/courses/:courseId", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), getCourse);
router.put("/admin/courses/:courseId", verifyToken, checkRole(["ADMIN", "INSTRUCTOR"]), updateCourse);
router.delete("/admin/courses/:courseId", verifyToken, checkRole(["ADMIN"]), deleteCourse);
router.put(
  "/admin/courses/:courseId/weeks/:weekNumber",
  verifyToken,
  checkRole(["ADMIN", "INSTRUCTOR"]),
  updateCourseWeek
);
router.get(
  "/admin/courses/:courseId/modules/:weekNumber",
  verifyToken,
  checkRole(["ADMIN", "INSTRUCTOR"]),
  getAdminModule
);
router.put(
  "/admin/courses/:courseId/modules/:weekNumber",
  verifyToken,
  checkRole(["ADMIN", "INSTRUCTOR"]),
  updateAdminModule
);

// Public LMS course (released content)
router.get("/courses/:courseId/lms", getLmsCourse);

// Public routes
router.get("/courses/:courseId", getCourse);

export default router;

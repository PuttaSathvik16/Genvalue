import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import * as studentPlannerController from '../controllers/studentPlannerController.js';
import { verifyLmsToken } from '../middleware/auth.js';

const router = express.Router();

// LMS student portal — Firebase auth only
router.use(verifyLmsToken);

// Get student dashboard overview
router.get('/overview', dashboardController.getStudentDashboard);

// Get student progress for a specific course
router.get('/progress/:courseId', dashboardController.getStudentProgress);

// Get upcoming deadlines
router.get('/deadlines', dashboardController.getUpcomingDeadlines);

// Get available courses
router.get('/available-courses', dashboardController.getAvailableCourses);

// Enroll in a course
router.post('/enroll', dashboardController.enrollCourse);

// Mark course as completed
router.post('/complete-course', dashboardController.completeCourse);

// Activity heatmap & student planner
router.get('/activity/heatmap', studentPlannerController.getActivityHeatmap);
router.get('/planner/insights', studentPlannerController.getPlannerInsights);
router.get('/planner', studentPlannerController.listPlannerEvents);
router.post('/planner', studentPlannerController.createPlannerEvent);
router.patch('/planner/:id', studentPlannerController.updatePlannerEvent);
router.delete('/planner/:id', studentPlannerController.deletePlannerEvent);

export default router;


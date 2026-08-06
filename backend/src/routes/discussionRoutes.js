import express from "express";
import { verifyToken, checkRole } from "../middleware/auth.js";
import {
  isInstructorOrAdmin,
  isAdmin,
  isInstructorForCourse,
  isEnrolledInCourse,
} from "../middleware/discussionPermissions.js";
import * as discussionController from "../controllers/discussionController.js";
import * as replyController from "../controllers/replyController.js";
import * as moderationController from "../controllers/moderationController.js";

const router = express.Router();

// ========== DISCUSSION ENDPOINTS ==========

// Public - Get all discussions
router.get("/discussions", discussionController.getDiscussions);

// Get single discussion
router.get("/discussions/:id", discussionController.getDiscussionById);

// Student - Create discussion
router.post(
  "/discussions",
  verifyToken,
  checkRole(["STUDENT"]),
  discussionController.createDiscussion
);

// Student - Update own discussion
router.put(
  "/discussions/:id",
  verifyToken,
  discussionController.updateDiscussion
);

// Instructor/Admin - Pin discussion
router.post(
  "/discussions/:id/pin",
  verifyToken,
  isInstructorOrAdmin,
  discussionController.togglePinDiscussion
);

// Instructor/Admin - Lock discussion
router.post(
  "/discussions/:id/lock",
  verifyToken,
  isInstructorOrAdmin,
  discussionController.toggleLockDiscussion
);

// Instructor/Admin - Update discussion status
router.patch(
  "/discussions/:id/status",
  verifyToken,
  isInstructorOrAdmin,
  discussionController.updateDiscussionStatus
);

// Admin - Delete discussion
router.delete(
  "/discussions/:id",
  verifyToken,
  isAdmin,
  discussionController.deleteDiscussion
);

// Student - Upvote discussion
router.post(
  "/discussions/:id/upvote",
  verifyToken,
  discussionController.upvoteDiscussion
);

// Student - Bookmark discussion
router.post(
  "/discussions/:id/bookmark",
  verifyToken,
  discussionController.bookmarkDiscussion
);

// Student - Get bookmarked discussions
router.get(
  "/discussions/bookmarks/list",
  verifyToken,
  discussionController.getBookmarkedDiscussions
);

// ========== REPLY ENDPOINTS ==========

// Create reply
router.post(
  "/discussions/:discussionId/replies",
  verifyToken,
  replyController.createReply
);

// Get discussion replies
router.get(
  "/discussions/:discussionId/replies",
  replyController.getDiscussionReplies
);

// Update reply
router.put(
  "/replies/:id",
  verifyToken,
  replyController.updateReply
);

// Delete reply
router.delete(
  "/replies/:id",
  verifyToken,
  replyController.deleteReply
);

// Instructor/Admin - Mark official answer
router.post(
  "/replies/:id/official",
  verifyToken,
  isInstructorOrAdmin,
  replyController.markOfficialAnswer
);

// Upvote reply
router.post(
  "/replies/:id/upvote",
  verifyToken,
  replyController.upvoteReply
);

// Student - Mark reply as helpful
router.post(
  "/replies/:id/helpful",
  verifyToken,
  replyController.markReplyHelpful
);

// Instructor/Admin - Hide reply
router.post(
  "/replies/:id/hide",
  verifyToken,
  isInstructorOrAdmin,
  replyController.hideReply
);

// ========== CATEGORY ENDPOINTS ==========

// Get all categories
router.get("/discussions/categories/list", moderationController.getCategories);

// Admin - Create category
router.post(
  "/discussions/categories",
  verifyToken,
  isAdmin,
  moderationController.createCategory
);

// Admin - Update category
router.put(
  "/discussions/categories/:id",
  verifyToken,
  isAdmin,
  moderationController.updateCategory
);

// Admin - Delete category
router.delete(
  "/discussions/categories/:id",
  verifyToken,
  isAdmin,
  moderationController.deleteCategory
);

// ========== TAG ENDPOINTS ==========

// Get all tags
router.get("/discussions/tags/list", moderationController.getTags);

// Admin - Create tag
router.post(
  "/discussions/tags",
  verifyToken,
  isAdmin,
  moderationController.createTag
);

// Admin - Delete tag
router.delete(
  "/discussions/tags/:id",
  verifyToken,
  isAdmin,
  moderationController.deleteTag
);

// ========== REPORT ENDPOINTS ==========

// Create report
router.post(
  "/discussions/reports",
  verifyToken,
  moderationController.reportContent
);

// Instructor/Admin - Get reports
router.get(
  "/discussions/reports/list",
  verifyToken,
  isInstructorOrAdmin,
  moderationController.getReports
);

// Admin - Review report
router.post(
  "/discussions/reports/:id/review",
  verifyToken,
  isAdmin,
  moderationController.reviewReport
);

// ========== MODERATION STATS ==========

// Get moderation dashboard stats
router.get(
  "/discussions/admin/stats",
  verifyToken,
  isInstructorOrAdmin,
  moderationController.getModerationStats
);

// Instructor - Get assigned discussions
router.get(
  "/discussions/instructor/assigned",
  verifyToken,
  isInstructorOrAdmin,
  moderationController.getAssignedDiscussions
);

export default router;

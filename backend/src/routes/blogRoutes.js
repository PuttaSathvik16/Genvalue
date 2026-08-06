import express from "express";
import * as blogController from "../controllers/blogController.js";
import { verifyLmsToken } from "../middleware/auth.js";
import {
  attachAdminUser,
  requireAdminPortalRole,
  requireAdminSession,
} from "../controllers/authorizedAdminController.js";

const router = express.Router();

// Public feed
router.get("/posts", blogController.getPublishedPosts);

// LMS student portal — Firebase auth only; submissions always enter review queue
router.get("/posts/mine/all", verifyLmsToken, blogController.getMyPosts);
router.post("/posts", verifyLmsToken, blogController.createPost);
router.post("/upload-cover", verifyLmsToken, blogController.uploadBlogCover);
router.put("/posts/:id", verifyLmsToken, blogController.updatePost);
router.delete("/posts/:id", verifyLmsToken, blogController.deletePost);

// Admin portal — OTP session required
const adminDispatch = [
  requireAdminSession,
  attachAdminUser,
  requireAdminPortalRole("DISPATCH"),
];

router.get("/admin/pending", ...adminDispatch, blogController.getPendingPosts);
router.get("/admin/list", ...adminDispatch, blogController.getAdminPosts);
router.post("/admin/posts", ...adminDispatch, blogController.createAdminPost);
router.post("/admin/upload-cover", ...adminDispatch, blogController.uploadBlogCover);
router.patch("/admin/:id/approve", ...adminDispatch, blogController.approvePost);
router.patch("/admin/:id/reject", ...adminDispatch, blogController.rejectPost);

// Public single post (published only for anonymous visitors)
router.get("/posts/:slug", blogController.getPostBySlug);

export default router;

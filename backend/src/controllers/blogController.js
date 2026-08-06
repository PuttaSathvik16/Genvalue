import { prisma } from "../config/database.js";
import { hasAdminAccess, hasStaffAccess } from "../middleware/auth.js";
import { validateBase64Image } from "../utils/secureImageUpload.js";
import {
  BLOG_POST_INCLUDE,
  estimateReadTime,
  generateUniqueSlug,
  normalizeTag,
  normalizeTagsList,
  serializeBlogPost,
} from "../utils/blogHelpers.js";

function isStaffUser(user) {
  return hasStaffAccess(user) || hasAdminAccess(user);
}

function canReviewPosts(user) {
  return hasAdminAccess(user) || user?.isSuperAdmin;
}

/**
 * Public feed — published posts only.
 */
export const getPublishedPosts = async (req, res) => {
  try {
    const { limit = 20, offset = 0, featured, tag } = req.query;
    const where = { status: "PUBLISHED" };
    if (featured === "true") where.featured = true;

    let posts = await prisma.blogPost.findMany({
      where,
      include: BLOG_POST_INCLUDE,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: tag ? 100 : Math.min(Number(limit) || 20, 50),
      skip: tag ? 0 : Number(offset) || 0,
    });

    if (tag) {
      const q = normalizeTag(String(tag)).toLowerCase();
      posts = posts.filter((p) => (p.tags ?? []).some((t) => t.toLowerCase() === q));
      posts = posts.slice(Number(offset) || 0, (Number(offset) || 0) + Math.min(Number(limit) || 20, 50));
    }

    res.json({
      success: true,
      data: posts.map(serializeBlogPost),
    });
  } catch (error) {
    console.error("Get published posts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog posts" });
  }
};

/**
 * Public single post by slug (published only unless author/admin).
 */
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: BLOG_POST_INCLUDE,
    });

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userId = req.user?.uid;
    const isAuthor = userId && post.authorId === userId;
    const isStaff = isStaffUser(req.user);

    if (post.status !== "PUBLISHED" && !isAuthor && !isStaff) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: serializeBlogPost(post) });
  } catch (error) {
    console.error("Get post by slug error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch blog post" });
  }
};

/**
 * Student/staff — own submissions.
 */
export const getMyPosts = async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { authorId: req.user.uid },
      include: BLOG_POST_INCLUDE,
      orderBy: { updatedAt: "desc" },
    });

    res.json({ success: true, data: posts.map(serializeBlogPost) });
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch your posts" });
  }
};

function isLmsStudentContext(req) {
  return req.authSource === "lms";
}

/**
 * Create a blog post from the LMS student portal — always queued for review.
 */
export const createPost = async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, coverImage } = req.body;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title, excerpt, and content are required",
      });
    }

    const slug = await generateUniqueSlug(prisma, title);

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: title.trim(),
        excerpt: excerpt.trim().slice(0, 500),
        content: content.trim(),
        category: category?.trim() || "General AI",
        tags: normalizeTagsList(tags),
        coverImage: coverImage?.trim() || null,
        readTime: estimateReadTime(content),
        featured: false,
        status: "PENDING",
        authorId: req.user.uid,
        publishedAt: null,
      },
      include: BLOG_POST_INCLUDE,
    });

    res.status(201).json({
      success: true,
      data: serializeBlogPost(post),
      message: "Blog submitted for admin review",
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, message: "Failed to create blog post" });
  }
};

/**
 * Admin portal — publish immediately (team dispatches).
 */
export const createAdminPost = async (req, res) => {
  try {
    if (!canReviewPosts(req.user)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { title, excerpt, content, category, tags, coverImage, featured } = req.body;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title, excerpt, and content are required",
      });
    }

    const slug = await generateUniqueSlug(prisma, title);
    const now = new Date();

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: title.trim(),
        excerpt: excerpt.trim().slice(0, 500),
        content: content.trim(),
        category: category?.trim() || "General AI",
        tags: normalizeTagsList(tags),
        coverImage: coverImage?.trim() || null,
        readTime: estimateReadTime(content),
        featured: Boolean(featured),
        status: "PUBLISHED",
        authorId: req.user.uid,
        publishedAt: now,
      },
      include: BLOG_POST_INCLUDE,
    });

    res.status(201).json({
      success: true,
      data: serializeBlogPost(post),
      message: "Blog post published to The Dispatch",
    });
  } catch (error) {
    console.error("Create admin post error:", error);
    res.status(500).json({ success: false, message: "Failed to create blog post" });
  }
};

/**
 * Update own post (student: PENDING/REJECTED only; staff: any).
 */
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.blogPost.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isAuthor = existing.authorId === req.user.uid;
    const staff = !isLmsStudentContext(req) && isStaffUser(req.user);

    if (!isAuthor && !staff) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (!staff && !["PENDING", "REJECTED", "DRAFT"].includes(existing.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or rejected posts can be edited",
      });
    }

    const { title, excerpt, content, category, tags, coverImage, featured } = req.body;
    const data = {};

    if (title?.trim()) data.title = title.trim();
    if (excerpt?.trim()) data.excerpt = excerpt.trim().slice(0, 500);
    if (content?.trim()) {
      data.content = content.trim();
      data.readTime = estimateReadTime(content);
    }
    if (category?.trim()) data.category = category.trim();
    if (Array.isArray(tags)) data.tags = normalizeTagsList(tags);
    if (coverImage !== undefined) data.coverImage = coverImage?.trim() || null;
    if (staff && featured !== undefined) data.featured = Boolean(featured);

    // Student resubmitting after rejection
    if (!staff && existing.status === "REJECTED") {
      data.status = "PENDING";
      data.reviewNotes = null;
      data.reviewedById = null;
    }

    const post = await prisma.blogPost.update({
      where: { id },
      data,
      include: BLOG_POST_INCLUDE,
    });

    res.json({ success: true, data: serializeBlogPost(post) });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ success: false, message: "Failed to update blog post" });
  }
};

/**
 * Admin queue — pending student submissions.
 */
export const getPendingPosts = async (req, res) => {
  try {
    if (!canReviewPosts(req.user)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const posts = await prisma.blogPost.findMany({
      where: { status: "PENDING" },
      include: BLOG_POST_INCLUDE,
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: posts.map(serializeBlogPost) });
  } catch (error) {
    console.error("Get pending posts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch pending posts" });
  }
};

/**
 * Admin — all posts with optional status filter.
 */
export const getAdminPosts = async (req, res) => {
  try {
    if (!canReviewPosts(req.user)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { status, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (status) where.status = status;

    const posts = await prisma.blogPost.findMany({
      where,
      include: BLOG_POST_INCLUDE,
      orderBy: { updatedAt: "desc" },
      take: Math.min(Number(limit) || 50, 100),
      skip: Number(offset) || 0,
    });

    res.json({ success: true, data: posts.map(serializeBlogPost) });
  } catch (error) {
    console.error("Get admin posts error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

/**
 * Approve a pending post → PUBLISHED.
 */
export const approvePost = async (req, res) => {
  try {
    if (!canReviewPosts(req.user)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { id } = req.params;
    const { featured } = req.body ?? {};

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        reviewedById: req.user.uid,
        reviewNotes: null,
        ...(featured !== undefined ? { featured: Boolean(featured) } : {}),
      },
      include: BLOG_POST_INCLUDE,
    });

    res.json({
      success: true,
      data: serializeBlogPost(post),
      message: "Post approved and published to The Dispatch",
    });
  } catch (error) {
    console.error("Approve post error:", error);
    res.status(500).json({ success: false, message: "Failed to approve post" });
  }
};

/**
 * Reject a pending post with optional notes.
 */
export const rejectPost = async (req, res) => {
  try {
    if (!canReviewPosts(req.user)) {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { id } = req.params;
    const { reviewNotes } = req.body ?? {};

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedById: req.user.uid,
        reviewNotes: reviewNotes?.trim()?.slice(0, 500) || "Please revise and resubmit.",
      },
      include: BLOG_POST_INCLUDE,
    });

    res.json({
      success: true,
      data: serializeBlogPost(post),
      message: "Post rejected — author can revise and resubmit",
    });
  } catch (error) {
    console.error("Reject post error:", error);
    res.status(500).json({ success: false, message: "Failed to reject post" });
  }
};

/**
 * Delete a post (author for non-published, admin for any).
 */
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.blogPost.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const isAuthor = existing.authorId === req.user.uid;
    const staff = !isLmsStudentContext(req) && canReviewPosts(req.user);

    if (!isAuthor && !staff) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (!staff && existing.status === "PUBLISHED") {
      return res.status(400).json({
        success: false,
        message: "Published posts cannot be deleted by students",
      });
    }

    await prisma.blogPost.delete({ where: { id } });

    res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

/**
 * Upload dispatch cover image to Cloudinary (authenticated).
 */
export const uploadBlogCover = async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.user.uid;

    if (!image) {
      return res.status(400).json({ success: false, message: "Image data is required" });
    }

    const imageCheck = validateBase64Image(image);
    if (!imageCheck.ok) {
      return res.status(400).json({ success: false, message: imageCheck.message });
    }

    const { uploadBlogCoverBase64 } = await import("../config/cloudinary.js");
    const uploadResult = await uploadBlogCoverBase64(
      imageCheck.dataUri,
      `cover-${userId}-${Date.now()}`
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload cover image",
        error: uploadResult.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Cover image uploaded",
      data: { url: uploadResult.url, publicId: uploadResult.publicId },
    });
  } catch (error) {
    console.error("Upload blog cover error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload cover image",
      error: error.message,
    });
  }
};

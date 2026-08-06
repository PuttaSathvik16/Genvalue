import prisma from "../config/database.js";
import { generateSlug } from "../utils/slugGenerator.js";

/**
 * Get all discussions with filters
 */
export const getDiscussions = async (req, res) => {
  try {
    const { courseId, categoryId, status, filter, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (courseId) where.courseId = courseId;
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    // Apply filters
    if (filter === "solved") where.status = "SOLVED";
    if (filter === "unanswered") where.replyCount = 0;
    if (filter === "pinned") where.isPinned = true;

    // Search in title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Exclude archived and reported by default (unless specifically requested)
    if (filter !== "all") {
      where.isArchived = false;
      where.status = { not: "ARCHIVED" };
    }

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        include: {
          student: {
            select: { id: true, name: true, profilePicture: true, role: true },
          },
          course: { select: { id: true, title: true, slug: true } },
          category: { select: { id: true, name: true, color: true } },
          assignedTo: { select: { id: true, name: true } },
          tags: { include: { tag: true } },
          _count: { select: { replies: true, upvotes: true, bookmarks: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.discussion.count({ where }),
    ]);

    res.json({
      success: true,
      data: discussions.map((d) => ({
        id: d.id,
        title: d.title,
        slug: d.slug,
        description: d.description.substring(0, 200) + "...",
        student: d.student,
        course: d.course,
        category: d.category,
        assignedTo: d.assignedTo,
        tags: d.tags.map((t) => t.tag),
        status: d.status,
        isPinned: d.isPinned,
        isLocked: d.isLocked,
        viewCount: d.viewCount,
        replyCount: d.replyCount,
        upvoteCount: d.upvoteCount,
        bookmarkCount: d.bookmarkCount,
        createdAt: d.createdAt,
        hasOfficialAnswer: !!d.officialReplyId,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discussions",
      error: error.message,
    });
  }
};

/**
 * Get single discussion with replies
 */
export const getDiscussionById = async (req, res) => {
  try {
    const { id } = req.params;

    // Increment view count
    await prisma.discussion.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, name: true, profilePicture: true, role: true, bio: true },
        },
        course: { select: { id: true, title: true, slug: true } },
        category: { select: { id: true, name: true, color: true } },
        assignedTo: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        replies: {
          where: { isHidden: false, parentReplyId: null },
          include: {
            author: {
              select: { id: true, name: true, profilePicture: true, role: true },
            },
            childReplies: {
              where: { isHidden: false },
              include: {
                author: {
                  select: { id: true, name: true, profilePicture: true, role: true },
                },
              },
            },
            _count: { select: { upvotes: true, helpfulMarks: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        upvotes: req.user ? { where: { userId: req.user?.uid } } : undefined,
        bookmarks: req.user ? { where: { userId: req.user?.uid } } : undefined,
      },
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...discussion,
        isUpvotedByUser: discussion.upvotes?.length > 0 || false,
        isBookmarkedByUser: discussion.bookmarks?.length > 0 || false,
      },
    });
  } catch (error) {
    console.error("Get discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch discussion",
      error: error.message,
    });
  }
};

/**
 * Create new discussion (Student)
 */
export const createDiscussion = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, description, courseId, categoryId, tagIds = [] } = req.body;

    // Validate required fields
    if (!title || !description || !courseId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Title, description, course, and category are required",
      });
    }

    // Verify course exists and user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    const slug = generateSlug(title);

    // Create discussion with tags
    const discussion = await prisma.discussion.create({
      data: {
        title,
        description,
        slug,
        studentId: userId,
        courseId,
        categoryId,
        // Get course instructor for assignment
        assignedTo: {
          connect: {
            id: (await prisma.course.findUnique({ where: { id: courseId } }))
              ?.instructorId,
          },
        },
        tags: tagIds.length > 0 ? {
          create: tagIds.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        } : undefined,
      },
      include: {
        student: { select: { id: true, name: true, profilePicture: true } },
        course: { select: { id: true, title: true } },
        category: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    });

    // Create notification for assigned instructor
    if (discussion.assignedTo) {
      await prisma.notification.create({
        data: {
          userId: discussion.assignedToId,
          title: "New Discussion Created",
          message: `${discussion.student.name} created a new discussion: "${title}" in ${discussion.course.title}`,
          type: "ANNOUNCEMENT",
          actionUrl: `/admin/discussions/${discussion.id}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      data: discussion,
    });
  } catch (error) {
    console.error("Create discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create discussion",
      error: error.message,
    });
  }
};

/**
 * Update discussion (Student - own posts, Instructor/Admin - all)
 */
export const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, tagIds = [] } = req.body;
    const userId = req.user.uid;

    const discussion = await prisma.discussion.findUnique({
      where: { id },
    });

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    // Authorization check
    const isOwner = discussion.studentId === userId;
    const isAdmin = req.user.role === "ADMIN";
    const isInstructor = req.user.role === "INSTRUCTOR";

    if (!isOwner && !isAdmin && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this discussion",
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (categoryId) updateData.categoryId = categoryId;

    const updated = await prisma.discussion.update({
      where: { id },
      data: updateData,
      include: {
        student: { select: { id: true, name: true } },
        course: { select: { id: true, title: true } },
        category: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    });

    res.json({
      success: true,
      message: "Discussion updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discussion",
      error: error.message,
    });
  }
};

/**
 * Pin/Unpin discussion (Instructor/Admin)
 */
export const togglePinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const updated = await prisma.discussion.update({
      where: { id },
      data: { isPinned: !discussion.isPinned },
    });

    res.json({
      success: true,
      message: `Discussion ${updated.isPinned ? "pinned" : "unpinned"} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("Toggle pin error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discussion",
      error: error.message,
    });
  }
};

/**
 * Lock/Unlock discussion (Instructor/Admin)
 */
export const toggleLockDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const updated = await prisma.discussion.update({
      where: { id },
      data: { isLocked: !discussion.isLocked },
    });

    res.json({
      success: true,
      message: `Discussion ${updated.isLocked ? "locked" : "unlocked"} successfully`,
      data: updated,
    });
  } catch (error) {
    console.error("Toggle lock error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discussion",
      error: error.message,
    });
  }
};

/**
 * Mark discussion as solved/closed (Student - own, Instructor/Admin)
 */
export const updateDiscussionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // OPEN, SOLVED, CLOSED, LOCKED, ARCHIVED, REPORTED

    if (!["OPEN", "SOLVED", "CLOSED", "LOCKED", "ARCHIVED", "REPORTED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const updated = await prisma.discussion.update({
      where: { id },
      data: {
        status,
        solvedAt: status === "SOLVED" ? new Date() : null,
      },
    });

    res.json({
      success: true,
      message: `Discussion marked as ${status.toLowerCase()}`,
      data: updated,
    });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update discussion status",
      error: error.message,
    });
  }
};

/**
 * Delete discussion (Admin only)
 */
export const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    await prisma.discussion.delete({ where: { id } });

    res.json({
      success: true,
      message: "Discussion deleted successfully",
    });
  } catch (error) {
    console.error("Delete discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete discussion",
      error: error.message,
    });
  }
};

/**
 * Upvote discussion
 */
export const upvoteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    // Check if already upvoted
    const existing = await prisma.discussionUpvote.findUnique({
      where: { discussionId_userId: { discussionId: id, userId } },
    });

    if (existing) {
      // Remove upvote
      await prisma.discussionUpvote.delete({
        where: { discussionId_userId: { discussionId: id, userId } },
      });

      await prisma.discussion.update({
        where: { id },
        data: { upvoteCount: { decrement: 1 } },
      });

      return res.json({
        success: true,
        message: "Upvote removed",
        upvoted: false,
      });
    }

    // Add upvote
    await prisma.discussionUpvote.create({
      data: { discussionId: id, userId },
    });

    await prisma.discussion.update({
      where: { id },
      data: { upvoteCount: { increment: 1 } },
    });

    res.json({
      success: true,
      message: "Discussion upvoted",
      upvoted: true,
    });
  } catch (error) {
    console.error("Upvote discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upvote discussion",
      error: error.message,
    });
  }
};

/**
 * Bookmark discussion
 */
export const bookmarkDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const discussion = await prisma.discussion.findUnique({ where: { id } });
    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const existing = await prisma.discussionBookmark.findUnique({
      where: { discussionId_userId: { discussionId: id, userId } },
    });

    if (existing) {
      await prisma.discussionBookmark.delete({
        where: { discussionId_userId: { discussionId: id, userId } },
      });

      await prisma.discussion.update({
        where: { id },
        data: { bookmarkCount: { decrement: 1 } },
      });

      return res.json({
        success: true,
        message: "Bookmark removed",
        bookmarked: false,
      });
    }

    await prisma.discussionBookmark.create({
      data: { discussionId: id, userId },
    });

    await prisma.discussion.update({
      where: { id },
      data: { bookmarkCount: { increment: 1 } },
    });

    res.json({
      success: true,
      message: "Discussion bookmarked",
      bookmarked: true,
    });
  } catch (error) {
    console.error("Bookmark discussion error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bookmark discussion",
      error: error.message,
    });
  }
};

/**
 * Get bookmarked discussions (Student)
 */
export const getBookmarkedDiscussions = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      prisma.discussionBookmark.findMany({
        where: { userId },
        include: {
          discussion: {
            include: {
              student: { select: { id: true, name: true, profilePicture: true } },
              course: { select: { id: true, title: true } },
              category: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.discussionBookmark.count({ where: { userId } }),
    ]);

    res.json({
      success: true,
      data: bookmarks.map((b) => b.discussion),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get bookmarked discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookmarked discussions",
      error: error.message,
    });
  }
};

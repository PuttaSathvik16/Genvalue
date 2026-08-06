import prisma from "../config/database.js";

/**
 * Get discussion categories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.discussionCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

/**
 * Create category (Admin only)
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const category = await prisma.discussionCategory.create({
      data: {
        name,
        slug,
        description,
        icon,
        color,
        order: order || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message,
    });
  }
};

/**
 * Update category (Admin only)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, order, isActive } = req.body;

    const category = await prisma.discussionCategory.findUnique({ where: { id } });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const updated = await prisma.discussionCategory.update({
      where: { id },
      data: {
        name: name || category.name,
        description: description !== undefined ? description : category.description,
        icon: icon !== undefined ? icon : category.icon,
        color: color !== undefined ? color : category.color,
        order: order !== undefined ? order : category.order,
        isActive: isActive !== undefined ? isActive : category.isActive,
      },
    });

    res.json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message,
    });
  }
};

/**
 * Delete category (Admin only)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has discussions
    const discussionCount = await prisma.discussion.count({
      where: { categoryId: id },
    });

    if (discussionCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with existing discussions",
      });
    }

    await prisma.discussionCategory.delete({ where: { id } });

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message,
    });
  }
};

/**
 * Get discussion tags
 */
export const getTags = async (req, res) => {
  try {
    const tags = await prisma.discussionTag.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tags",
      error: error.message,
    });
  }
};

/**
 * Create tag (Admin only)
 */
export const createTag = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required",
      });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    const tag = await prisma.discussionTag.create({
      data: {
        name,
        slug,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: tag,
    });
  } catch (error) {
    console.error("Create tag error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create tag",
      error: error.message,
    });
  }
};

/**
 * Delete tag (Admin only)
 */
export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.discussionTag.delete({ where: { id } });

    res.json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Delete tag error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete tag",
      error: error.message,
    });
  }
};

/**
 * Report discussion or reply
 */
export const reportContent = async (req, res) => {
  try {
    const { discussionId, replyId, reason, message } = req.body;
    const userId = req.user.uid;

    if (!discussionId && !replyId) {
      return res.status(400).json({
        success: false,
        message: "Discussion ID or Reply ID is required",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    const report = await prisma.discussionReport.create({
      data: {
        discussionId: discussionId || null,
        replyId: replyId || null,
        reason,
        message,
        reportedByUserId: userId,
      },
    });

    // Mark discussion as reported if it's a discussion report
    if (discussionId && !replyId) {
      await prisma.discussion.update({
        where: { id: discussionId },
        data: { status: "REPORTED" },
      });
    }

    // Notify admins of new report
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: "New Content Report",
          message: `New report received: ${reason}`,
          type: "ANNOUNCEMENT",
          actionUrl: `/admin/moderation/reports/${report.id}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: report,
    });
  } catch (error) {
    console.error("Report content error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit report",
      error: error.message,
    });
  }
};

/**
 * Get reports (Admin/Instructor)
 */
export const getReports = async (req, res) => {
  try {
    const { status = "PENDING", page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.discussionReport.findMany({
        where,
        include: {
          discussion: { select: { id: true, title: true } },
          reply: { select: { id: true, content: true } },
          reportedByUser: { select: { id: true, name: true } },
          reviewedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.discussionReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
};

/**
 * Review report (Admin only)
 */
export const reviewReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, resolution, action } = req.body; // action: DISMISS, HIDE, DELETE, WARN
    const userId = req.user.uid;

    if (!["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const report = await prisma.discussionReport.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const updated = await prisma.discussionReport.update({
      where: { id },
      data: {
        status,
        adminNotes,
        resolution,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    });

    // Take action based on report
    if (action === "HIDE" && report.replyId) {
      await prisma.reply.update({
        where: { id: report.replyId },
        data: { isHidden: true },
      });
    }

    if (action === "DELETE" && report.discussionId) {
      await prisma.discussion.delete({ where: { id: report.discussionId } });
    }

    // Notify reporter of resolution
    await prisma.notification.create({
      data: {
        userId: report.reportedByUserId,
        title: "Your Report Has Been Reviewed",
        message: `Your report has been reviewed and the status is: ${status}`,
        type: "ANNOUNCEMENT",
      },
    });

    res.json({
      success: true,
      message: "Report reviewed successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Review report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to review report",
      error: error.message,
    });
  }
};

/**
 * Get moderation dashboard stats (Admin/Instructor)
 */
export const getModerationStats = async (req, res) => {
  try {
    const [
      totalDiscussions,
      openDiscussions,
      solvedDiscussions,
      pendingReports,
      pinnedDiscussions,
      lockedDiscussions,
      archivedDiscussions,
    ] = await Promise.all([
      prisma.discussion.count(),
      prisma.discussion.count({ where: { status: "OPEN" } }),
      prisma.discussion.count({ where: { status: "SOLVED" } }),
      prisma.discussionReport.count({ where: { status: "PENDING" } }),
      prisma.discussion.count({ where: { isPinned: true } }),
      prisma.discussion.count({ where: { isLocked: true } }),
      prisma.discussion.count({ where: { isArchived: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalDiscussions,
        openDiscussions,
        solvedDiscussions,
        pendingReports,
        pinnedDiscussions,
        lockedDiscussions,
        archivedDiscussions,
      },
    });
  } catch (error) {
    console.error("Get moderation stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch moderation stats",
      error: error.message,
    });
  }
};

/**
 * Get discussions assigned to instructor
 */
export const getAssignedDiscussions = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      assignedToId: userId,
    };

    if (status) where.status = status;

    const [discussions, total] = await Promise.all([
      prisma.discussion.findMany({
        where,
        include: {
          student: { select: { id: true, name: true, profilePicture: true } },
          course: { select: { id: true, title: true } },
          category: { select: { id: true, name: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.discussion.count({ where }),
    ]);

    res.json({
      success: true,
      data: discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get assigned discussions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assigned discussions",
      error: error.message,
    });
  }
};

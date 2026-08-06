import prisma from "../config/database.js";

/**
 * Create reply to discussion
 */
export const createReply = async (req, res) => {
  try {
    const { discussionId, parentReplyId, content } = req.body;
    const userId = req.user.uid;

    if (!discussionId || !content) {
      return res.status(400).json({
        success: false,
        message: "Discussion ID and content are required",
      });
    }

    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
      include: { student: { select: { name: true, id: true } } },
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    if (discussion.isLocked) {
      return res.status(403).json({
        success: false,
        message: "This discussion is locked and cannot receive new replies",
      });
    }

    const reply = await prisma.reply.create({
      data: {
        content,
        authorId: userId,
        discussionId,
        parentReplyId: parentReplyId || null,
      },
      include: {
        author: {
          select: { id: true, name: true, profilePicture: true, role: true },
        },
      },
    });

    // Update discussion reply count
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { replyCount: { increment: 1 } },
    });

    // Notify discussion author if reply is not from them
    if (discussion.studentId !== userId) {
      await prisma.notification.create({
        data: {
          userId: discussion.studentId,
          title: "New Reply to Your Discussion",
          message: `New reply to "${discussion.title}"`,
          type: "MESSAGE",
          actionUrl: `/discussions/${discussionId}`,
        },
      });
    }

    // Notify if reply mentions instructor
    if (content.includes("@Instructor") && discussion.assignedToId) {
      await prisma.notification.create({
        data: {
          userId: discussion.assignedToId,
          title: "You were mentioned in a discussion",
          message: `Mentioned in discussion "${discussion.title}" by ${reply.author.name}`,
          type: "MESSAGE",
          actionUrl: `/admin/discussions/${discussionId}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Reply created successfully",
      data: reply,
    });
  } catch (error) {
    console.error("Create reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create reply",
      error: error.message,
    });
  }
};

/**
 * Get replies for discussion
 */
export const getDiscussionReplies = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const [replies, total] = await Promise.all([
      prisma.reply.findMany({
        where: {
          discussionId,
          isHidden: false,
          parentReplyId: null, // Get only top-level replies
        },
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
              upvotes: req.user ? { where: { userId: req.user?.uid } } : undefined,
              _count: { select: { upvotes: true, helpfulMarks: true } },
            },
            orderBy: { createdAt: "asc" },
          },
          upvotes: req.user ? { where: { userId: req.user?.uid } } : undefined,
          _count: { select: { upvotes: true, helpfulMarks: true } },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.reply.count({
        where: { discussionId, isHidden: false, parentReplyId: null },
      }),
    ]);

    res.json({
      success: true,
      data: replies.map((r) => ({
        ...r,
        upvotedByUser: r.upvotes?.length > 0 || false,
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get replies error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch replies",
      error: error.message,
    });
  }
};

/**
 * Update reply (own replies only, or instructor/admin)
 */
export const updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.uid;

    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    const isOwner = reply.authorId === userId;
    const isAdmin = req.user.role === "ADMIN";
    const isInstructor = req.user.role === "INSTRUCTOR";

    if (!isOwner && !isAdmin && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this reply",
      });
    }

    const updated = await prisma.reply.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: { id: true, name: true, profilePicture: true, role: true },
        },
      },
    });

    res.json({
      success: true,
      message: "Reply updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reply",
      error: error.message,
    });
  }
};

/**
 * Delete reply (own replies, or instructor/admin)
 */
export const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const reply = await prisma.reply.findUnique({
      where: { id },
      include: { discussion: true },
    });

    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    const isOwner = reply.authorId === userId;
    const isAdmin = req.user.role === "ADMIN";
    const isInstructor = req.user.role === "INSTRUCTOR";

    if (!isOwner && !isAdmin && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this reply",
      });
    }

    // Check if reply has child replies
    const childCount = await prisma.reply.count({
      where: { parentReplyId: id },
    });

    if (childCount > 0 && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete reply with child replies",
      });
    }

    // Soft delete by hiding or hard delete for admins
    if (isAdmin) {
      await prisma.reply.delete({ where: { id } });
    } else {
      await prisma.reply.update({
        where: { id },
        data: { isHidden: true },
      });
    }

    // Update discussion reply count
    await prisma.discussion.update({
      where: { id: reply.discussionId },
      data: { replyCount: { decrement: 1 } },
    });

    res.json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete reply",
      error: error.message,
    });
  }
};

/**
 * Mark reply as official answer (Instructor/Admin)
 */
export const markOfficialAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { discussionId } = req.body;

    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    // Check if this reply was already marked as official
    if (reply.isOfficialAnswer) {
      // Unmark
      await prisma.reply.update({
        where: { id },
        data: { isOfficialAnswer: false },
      });

      await prisma.discussion.update({
        where: { id: discussionId },
        data: { officialReplyId: null, status: "OPEN" },
      });

      return res.json({
        success: true,
        message: "Official answer unmarked",
      });
    }

    // Mark as official
    // First, unmark any previous official answer
    if (discussion.officialReplyId) {
      await prisma.reply.update({
        where: { id: discussion.officialReplyId },
        data: { isOfficialAnswer: false },
      });
    }

    await prisma.reply.update({
      where: { id },
      data: { isOfficialAnswer: true },
    });

    await prisma.discussion.update({
      where: { id: discussionId },
      data: { officialReplyId: id, status: "SOLVED" },
    });

    // Notify reply author
    await prisma.notification.create({
      data: {
        userId: reply.authorId,
        title: "Your reply was marked as official answer",
        message: `Your reply to "${discussion.title}" was marked as the official answer`,
        type: "MESSAGE",
      },
    });

    res.json({
      success: true,
      message: "Reply marked as official answer",
    });
  } catch (error) {
    console.error("Mark official answer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark official answer",
      error: error.message,
    });
  }
};

/**
 * Upvote reply
 */
export const upvoteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    const existing = await prisma.replyUpvote.findUnique({
      where: { replyId_userId: { replyId: id, userId } },
    });

    if (existing) {
      await prisma.replyUpvote.delete({
        where: { replyId_userId: { replyId: id, userId } },
      });

      await prisma.reply.update({
        where: { id },
        data: { upvoteCount: { decrement: 1 } },
      });

      return res.json({
        success: true,
        message: "Upvote removed",
        upvoted: false,
      });
    }

    await prisma.replyUpvote.create({
      data: { replyId: id, userId },
    });

    await prisma.reply.update({
      where: { id },
      data: { upvoteCount: { increment: 1 } },
    });

    res.json({
      success: true,
      message: "Reply upvoted",
      upvoted: true,
    });
  } catch (error) {
    console.error("Upvote reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upvote reply",
      error: error.message,
    });
  }
};

/**
 * Mark reply as helpful (Student - own discussion posts only)
 */
export const markReplyHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const reply = await prisma.reply.findUnique({
      where: { id },
      include: { discussion: true },
    });

    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    // Check if user owns the discussion
    if (reply.discussion.studentId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only the discussion author can mark replies as helpful",
      });
    }

    const existing = await prisma.replyHelpful.findUnique({
      where: { replyId_markedByUserId: { replyId: id, markedByUserId: userId } },
    });

    if (existing) {
      await prisma.replyHelpful.delete({
        where: { replyId_markedByUserId: { replyId: id, markedByUserId: userId } },
      });

      await prisma.reply.update({
        where: { id },
        data: { helpfulCount: { decrement: 1 } },
      });

      return res.json({
        success: true,
        message: "Helpful mark removed",
        marked: false,
      });
    }

    await prisma.replyHelpful.create({
      data: { replyId: id, markedByUserId: userId },
    });

    await prisma.reply.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } },
    });

    res.json({
      success: true,
      message: "Reply marked as helpful",
      marked: true,
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark reply as helpful",
      error: error.message,
    });
  }
};

/**
 * Hide reply (Instructor/Admin - moderation)
 */
export const hideReply = async (req, res) => {
  try {
    const { id } = req.params;

    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      return res.status(404).json({ success: false, message: "Reply not found" });
    }

    await prisma.reply.update({
      where: { id },
      data: { isHidden: true },
    });

    res.json({
      success: true,
      message: "Reply hidden successfully",
    });
  } catch (error) {
    console.error("Hide reply error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to hide reply",
      error: error.message,
    });
  }
};

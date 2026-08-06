import prisma from "../config/database.js";

/**
 * Check if user is owner of discussion or has admin/instructor role
 */
export const canModifyDiscussion = async (req, res, next) => {
  try {
    const { discussionId } = req.body || req.params;
    const userId = req.user.uid;

    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: "Discussion not found" });
    }

    const isOwner = discussion.studentId === userId;
    const isAdmin = req.user.role === "ADMIN";
    const isInstructor = req.user.role === "INSTRUCTOR" && discussion.assignedToId === userId;

    if (!isOwner && !isAdmin && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this discussion",
      });
    }

    req.discussion = discussion;
    next();
  } catch (error) {
    console.error("Permission check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check permissions",
      error: error.message,
    });
  }
};

/**
 * Check if user is instructor or admin
 */
export const isInstructorOrAdmin = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole !== "INSTRUCTOR" && userRole !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only instructors and admins can perform this action",
    });
  }

  next();
};

/**
 * Check if user is admin
 */
export const isAdmin = (req, res, next) => {
  const userRole = req.user?.role;

  if (userRole !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only admins can perform this action",
    });
  }

  next();
};

/**
 * Check if user is instructor for the course
 */
export const isInstructorForCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body || req.params;
    const userId = req.user.uid;

    if (req.user.role === "ADMIN") {
      return next();
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (course.instructorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not the instructor for this course",
      });
    }

    req.course = course;
    next();
  } catch (error) {
    console.error("Course instructor check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check permissions",
      error: error.message,
    });
  }
};

/**
 * Check if user is enrolled in course
 */
export const isEnrolledInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body || req.params;
    const userId = req.user.uid;

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });
    }

    req.enrollment = enrollment;
    next();
  } catch (error) {
    console.error("Enrollment check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check enrollment",
      error: error.message,
    });
  }
};

import { prisma } from "../config/database.js";
import { hasAdminAccess, hasStaffAccess } from "../middleware/auth.js";
import {
  buildLessonContent,
  ensureDefaultCourseCatalog,
  formatCourseForAdmin,
  formatModuleAsWeek,
  parseLessonContent,
} from "../utils/ensureCourseCatalog.js";
import {
  formatCourseCardsForAdmin,
  formatCourseForLms,
  getAdminModuleDetail,
  updateAdminModuleDetail,
} from "../services/moduleService.js";

/**
 * Get all courses with modules/weeks (admin)
 */
export const getAllCourses = async (req, res) => {
  try {
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can view all courses",
      });
    }

    await ensureDefaultCourseCatalog();

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "asc" },
    });

    const data = await Promise.all(courses.map(formatCourseCardsForAdmin));

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
};

/**
 * Get a specific course with weeks
 */
export const getCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const data = await formatCourseForAdmin(course);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: error.message,
    });
  }
};

/**
 * Create a new course with 12 empty weeks
 */
export const createCourse = async (req, res) => {
  try {
    if (!hasAdminAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can create courses",
      });
    }

    const { title, slug, description, level, duration, status, weekCount = 12 } = req.body;

    if (!title?.trim() || !slug?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and slug are required",
      });
    }

    const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");

    const existing = await prisma.course.findUnique({ where: { slug: normalizedSlug } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A course with this slug already exists",
      });
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        slug: normalizedSlug,
        description: description?.trim() ?? "",
        level: level ?? "BEGINNER",
        duration: duration ?? `${weekCount} weeks`,
        status: status ?? "DRAFT",
      },
    });

    const weeks = Math.min(Math.max(Number(weekCount) || 12, 1), 24);
    for (let week = 1; week <= weeks; week += 1) {
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          week,
          order: week,
          title: `Week ${week}`,
          description: "",
          status: "DRAFT",
          isReleased: false,
        },
      });

      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: `Week ${week} Materials`,
          slug: `week-${week}-materials`,
          order: 1,
          content: buildLessonContent({ topics: [] }),
          status: "DRAFT",
        },
      });
    }

    const data = await formatCourseForAdmin(course);
    res.status(201).json({ success: true, message: "Course created", data });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    });
  }
};

/**
 * Update course metadata
 */
export const updateCourse = async (req, res) => {
  try {
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can update courses",
      });
    }

    const { courseId } = req.params;
    const { title, description, level, duration, status, slug } = req.body;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (slug && slug !== course.slug) {
      const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
      const conflict = await prisma.course.findUnique({ where: { slug: normalizedSlug } });
      if (conflict) {
        return res.status(409).json({ success: false, message: "Slug already in use" });
      }
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(level !== undefined ? { level } : {}),
        ...(duration !== undefined ? { duration } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(slug !== undefined
          ? { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") }
          : {}),
      },
    });

    const data = await formatCourseForAdmin(updated);
    res.json({ success: true, message: "Course updated", data });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update course",
      error: error.message,
    });
  }
};

/**
 * Update a specific week/module of a course
 */
export const updateCourseWeek = async (req, res) => {
  try {
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can update courses",
      });
    }

    const { courseId, weekNumber } = req.params;
    const week = Number(weekNumber);

    const {
      title,
      description,
      topics,
      videoUrl,
      pdfUrl,
      objectives,
      estimatedMinutes,
      isReleased,
      status,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Week title is required",
      });
    }

    const module = await prisma.module.findUnique({
      where: { courseId_week: { courseId, week } },
      include: { lessons: { orderBy: { order: "asc" }, take: 1 } },
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Week not found",
      });
    }

    const updatedModule = await prisma.module.update({
      where: { id: module.id },
      data: {
        title: title.trim(),
        description: description?.trim() ?? "",
        ...(isReleased !== undefined ? { isReleased: Boolean(isReleased) } : {}),
        ...(status !== undefined ? { status } : {}),
      },
      include: { lessons: { orderBy: { order: "asc" }, take: 1 } },
    });

    const lesson = module.lessons[0];
    const existingMeta = parseLessonContent(lesson?.content);
    const content = buildLessonContent({
      topics: Array.isArray(topics) ? topics : existingMeta.topics,
      pdfUrl: pdfUrl !== undefined ? pdfUrl : existingMeta.pdfUrl,
      objectives: objectives !== undefined ? objectives : existingMeta.objectives,
      estimatedMinutes:
        estimatedMinutes !== undefined ? estimatedMinutes : existingMeta.estimatedMinutes,
    });

    if (lesson) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          title: `${title.trim()} Materials`,
          content,
          ...(videoUrl !== undefined ? { videoUrl: videoUrl || null } : {}),
        },
      });
    } else {
      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: `${title.trim()} Materials`,
          slug: `week-${week}-materials`,
          order: 1,
          content,
          videoUrl: videoUrl || null,
          status: status ?? "ACTIVE",
        },
      });
    }

    const refreshed = await prisma.module.findUnique({
      where: { id: updatedModule.id },
      include: { lessons: { orderBy: { order: "asc" }, take: 1 } },
    });

    res.json({
      success: true,
      message: "Week updated successfully",
      data: formatModuleAsWeek(refreshed),
    });
  } catch (error) {
    console.error("Update week error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update week",
      error: error.message,
    });
  }
};

/**
 * Delete a course
 */
export const deleteCourse = async (req, res) => {
  try {
    if (!hasAdminAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only admins can delete courses",
      });
    }

    const { courseId } = req.params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    await prisma.course.delete({ where: { id: courseId } });

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
      error: error.message,
    });
  }
};

/**
 * Full module detail for tabbed admin editor
 */
export const getAdminModule = async (req, res) => {
  try {
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { courseId, weekNumber } = req.params;
    const data = await getAdminModuleDetail(courseId, weekNumber);

    if (!data) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error("Get admin module error:", error);
    res.status(500).json({ success: false, message: "Failed to load module" });
  }
};

/**
 * Save full module (lessons, resources, settings)
 */
export const updateAdminModule = async (req, res) => {
  try {
    if (!hasStaffAccess(req.user)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { courseId, weekNumber } = req.params;
    const data = await updateAdminModuleDetail(courseId, weekNumber, req.body);

    if (!data) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    res.json({ success: true, message: "Module saved", data });
  } catch (error) {
    console.error("Update admin module error:", error);
    res.status(500).json({ success: false, message: "Failed to save module" });
  }
};

/**
 * LMS-facing course payload (released modules only)
 */
export const getLmsCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
        status: "ACTIVE",
      },
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const data = await formatCourseForLms(course);
    res.json({ success: true, data });
  } catch (error) {
    console.error("Get LMS course error:", error);
    res.status(500).json({ success: false, message: "Failed to load course" });
  }
};

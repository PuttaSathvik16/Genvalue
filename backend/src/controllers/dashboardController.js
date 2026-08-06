import prisma from '../config/database.js';
import { ensureDefaultCourseCatalog } from '../utils/ensureCourseCatalog.js';
import { formatCourseForLms } from '../services/moduleService.js';
import {
  getPublishedAnnouncementsForRole,
  syncAnnouncementNotificationsForUser,
} from '../utils/announcementFeed.js';

/**
 * Get student dashboard overview
 * Returns: progress stats, enrolled courses, upcoming deadlines, recent activity
 */
export const getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.uid; // This is the database ID from auth middleware

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const announcements = await getPublishedAnnouncementsForRole(user.role, 5);
    await syncAnnouncementNotificationsForUser(userId, user.role);

    // For now, return null enrollment - user hasn't enrolled yet
    // When Enrollment models are added, query actual enrollments here
    const dashboardData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      enrollment: null, // User not enrolled yet
      progress: {
        overallProgress: 0,
        completedLessons: 0,
        totalLessons: 36,
        completedModules: 0,
        totalModules: 12,
      },
      stats: {
        quizAverage: 0,
        quizzesTaken: 0,
        quizzesTotal: 12,
        assignmentsSubmitted: 0,
        assignmentsTotal: 12,
        certificatesEarned: 0,
      },
      upcomingDeadlines: [],
      recentActivity: [],
      announcements,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

/**
 * Get student progress for a specific course
 */
export const getStudentProgress = async (req, res) => {
  try {
    const userId = req.user.uid; // Database ID
    const { courseId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // TODO: Implement when CourseProgress model is added
    const progressData = {
      courseId,
      userId: user.id,
      overallProgress: 0,
      completedLessons: [],
      lastAccessedLesson: null,
      timeSpent: 0,
      startedAt: user.createdAt,
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      data: progressData,
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress data',
      error: error.message,
    });
  }
};

/**
 * Enroll student in a course
 */
export const enrollCourse = async (req, res) => {
  try {
    const userId = req.user.uid; // Database ID
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // TODO: Implement when Enrollment model is added
    // For now, store enrollment in session or return success
    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        userId: user.id,
        courseId: courseId,
        enrolledAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message,
    });
  }
};

/**
 * Get available courses from database (admin-managed content)
 */
export const getAvailableCourses = async (req, res) => {
  try {
    await ensureDefaultCourseCatalog();

    const courses = await prisma.course.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
    });

    const data = await Promise.all(
      courses.map(async (course) => {
        const lms = await formatCourseForLms(course);
        return {
          id: lms.id,
          title: lms.title,
          slug: lms.slug,
          description: lms.description,
          subtitle: lms.description,
          duration: lms.duration,
          level: lms.level,
          status: lms.status,
          weeks: lms.weeks.map((week) => ({
            week: week.week,
            moduleId: week.moduleId,
            title: week.title,
            description: week.description,
            topics: week.topics,
            estimatedMinutes: week.estimatedMinutes,
            lessonCount: week.lessons.length,
            difficultyLevel: week.difficultyLevel,
          })),
        };
      })
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Courses fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message,
    });
  }
};

/**
 * Mark course as completed and generate certificate
 */
export const completeCourse = async (req, res) => {
  try {
    const userId = req.user.uid; // Database ID
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update enrollment status to COMPLETED
    const enrollment = await prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Check if certificate already exists
    let certificate = await prisma.certificate.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    // If no certificate exists, generate one
    if (!certificate) {
      const { generateCertificateId } = await import('../utils/certificateGenerator.js');
      const certificateId = generateCertificateId();

      certificate = await prisma.certificate.create({
        data: {
          certificateId,
          userId,
          courseId,
          issuedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: 'Course completed and certificate generated',
      data: {
        enrollment: {
          status: enrollment.status,
          completedAt: enrollment.completedAt,
        },
        certificate: {
          id: certificate.id,
          certificateId: certificate.certificateId,
          issuedAt: certificate.issuedAt,
        },
      },
    });
  } catch (error) {
    console.error('Complete course error:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to complete course',
      error: error.message,
    });
  }
};

/**
 * Get upcoming assignments and quizzes
 */
export const getUpcomingDeadlines = async (req, res) => {
  try {
    const userId = req.user.uid; // Database ID

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // TODO: Implement when Assignment and Quiz models are added
    const deadlines = {
      assignments: [],
      quizzes: [],
    };

    res.json({
      success: true,
      data: deadlines,
    });
  } catch (error) {
    console.error('Deadlines fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch deadlines',
      error: error.message,
    });
  }
};


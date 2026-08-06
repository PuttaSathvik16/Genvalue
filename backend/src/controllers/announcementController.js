import { prisma } from '../config/database.js';
import {
  getPublishedAnnouncementsForRole,
  normalizeTargetAudience,
  announcementNotificationActionUrl,
  syncAnnouncementNotificationsForUser,
} from '../utils/announcementFeed.js';

async function notifyAudienceForAnnouncement(announcement, targetAudience, title, message, description) {
  const roles = [];

  if (targetAudience === 'ALL' || targetAudience === 'STUDENTS') {
    roles.push('STUDENT');
  }
  if (targetAudience === 'ALL' || targetAudience === 'INSTRUCTORS') {
    roles.push('INSTRUCTOR');
  }

  if (roles.length === 0) return 0;

  const recipients = await prisma.user.findMany({
    where: { role: { in: roles } },
    select: { id: true, role: true },
  });

  if (recipients.length === 0) return 0;

  const notifications = recipients.map((user) => ({
    userId: user.id,
    announcementId: announcement.id,
    title,
    message: description || message,
    type: 'ANNOUNCEMENT',
    actionUrl: announcementNotificationActionUrl(user.role),
    actionLabel: 'View',
  }));

  await prisma.notification.createMany({
    data: notifications,
  });

  return recipients.length;
}

/**
 * Create a new announcement (Admin only)
 */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, description, type, priority, imageUrl, targetAudience, expiresAt } = req.body;
    const createdById = req.user.uid; // Database ID from auth middleware
    const audience = normalizeTargetAudience(targetAudience);

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required',
      });
    }

    // Create announcement
    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        description,
        type: type || 'GENERAL',
        priority: priority || 'NORMAL',
        imageUrl,
        targetAudience: audience,
        createdById,
        publishedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const notifiedCount = await notifyAudienceForAnnouncement(
      announcement,
      audience,
      title,
      message,
      description
    );

    res.status(201).json({
      success: true,
      data: announcement,
      notifiedCount,
      message: 'Announcement created and notifications sent',
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create announcement',
      error: error.message,
    });
  }
};

/**
 * Get all announcements (Admin)
 */
export const getAnnouncements = async (req, res) => {
  try {
    const { status, type, priority, limit = 20, offset = 0 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { notifications: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.announcement.count({ where });

    res.json({
      success: true,
      data: announcements,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements',
      error: error.message,
    });
  }
};

/**
 * Update an announcement (Admin)
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, description, type, priority, status, targetAudience, expiresAt } = req.body;

    const updateData = {
      title,
      message,
      description,
      type,
      priority,
      status,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      updatedAt: new Date(),
    };

    if (targetAudience !== undefined) {
      updateData.targetAudience = normalizeTargetAudience(targetAudience);
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      success: true,
      data: announcement,
      message: 'Announcement updated',
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement',
      error: error.message,
    });
  }
};

/**
 * Get published announcements for the signed-in user (role-aware LMS feed)
 */
export const getStudentAnnouncementFeed = async (req, res) => {
  try {
    await syncAnnouncementNotificationsForUser(req.user.uid, req.user.role);

    const announcements = await getPublishedAnnouncementsForRole(
      req.user.role,
      parseInt(req.query.limit, 10) || 10
    );

    res.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error("Student announcement feed error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch announcements",
      error: error.message,
    });
  }
};

/**
 * Delete an announcement (Admin)
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Announcement deleted',
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete announcement',
      error: error.message,
    });
  }
};

import { prisma } from '../config/database.js';
import { syncAnnouncementNotificationsForUser } from '../utils/announcementFeed.js';

/**
 * Get all notifications for a user
 */
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { isRead, type, limit = 20, offset = 0 } = req.query;

    await syncAnnouncementNotificationsForUser(userId, req.user.role);

    const where = { userId };
    if (isRead === 'true' || isRead === 'false') {
      where.isRead = isRead === 'true';
    }
    if (type) where.type = type;

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        announcement: {
          select: {
            id: true,
            title: true,
            message: true,
            imageUrl: true,
            priority: true,
            type: true,
            createdBy: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.notification.count({ where });
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const notification = await prisma.notification.updateMany({
      where: { id, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (notification.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const result = await prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.uid;

    await syncAnnouncementNotificationsForUser(userId, req.user.role);

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
    });
  }
};

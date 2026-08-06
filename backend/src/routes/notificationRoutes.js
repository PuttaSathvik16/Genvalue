import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { verifyLmsToken } from '../middleware/auth.js';

const router = express.Router();

// LMS student notifications — Firebase auth only
router.use(verifyLmsToken);

// Get all notifications for the user
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all as read
router.put('/read/all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

export default router;

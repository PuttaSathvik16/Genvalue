import express from 'express';
import * as announcementController from '../controllers/announcementController.js';
import { verifyLmsToken } from '../middleware/auth.js';
import {
  attachAdminUser,
  requireAdminPortalRole,
  requireAdminSession,
} from '../controllers/authorizedAdminController.js';

const router = express.Router();

// Student LMS feed — Firebase auth only
router.get('/feed', verifyLmsToken, announcementController.getStudentAnnouncementFeed);

// Admin portal — OTP session required (Firebase LMS tokens cannot manage announcements)
router.post(
  '/',
  requireAdminSession,
  attachAdminUser,
  requireAdminPortalRole('ANNOUNCEMENTS'),
  announcementController.createAnnouncement
);
router.get(
  '/admin/list',
  requireAdminSession,
  attachAdminUser,
  requireAdminPortalRole('ANNOUNCEMENTS'),
  announcementController.getAnnouncements
);
router.put(
  '/:id',
  requireAdminSession,
  attachAdminUser,
  requireAdminPortalRole('ANNOUNCEMENTS'),
  announcementController.updateAnnouncement
);
router.delete(
  '/:id',
  requireAdminSession,
  attachAdminUser,
  requireAdminPortalRole('ANNOUNCEMENTS'),
  announcementController.deleteAnnouncement
);

export default router;

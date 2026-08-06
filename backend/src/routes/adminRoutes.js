import express from "express";
import {
  getAdminAnalytics,
  listAdminUsers,
  getAdminAuditLogs,
} from "../controllers/adminAnalyticsController.js";
import { removeStudent } from "../controllers/adminUserController.js";
import { getPortalSecurityReport } from "../controllers/securityController.js";
import {
  listBugReports,
  updateBugReportStatus,
} from "../controllers/bugReportController.js";
import {
  requireAdminSession,
  requireAdminPortalRole,
} from "../controllers/authorizedAdminController.js";

const router = express.Router();

router.get(
  "/analytics",
  requireAdminSession,
  requireAdminPortalRole("ANALYTICS"),
  getAdminAnalytics
);
router.get(
  "/users",
  requireAdminSession,
  requireAdminPortalRole("STUDENTS"),
  listAdminUsers
);
router.post(
  "/users/:userId/remove",
  requireAdminSession,
  requireAdminPortalRole("STUDENTS"),
  removeStudent
);
router.get(
  "/audit-logs",
  requireAdminSession,
  requireAdminPortalRole("AUDIT_LOGS"),
  getAdminAuditLogs
);
router.get(
  "/security/report",
  requireAdminSession,
  requireAdminPortalRole("SECURITY"),
  getPortalSecurityReport
);
router.get(
  "/bug-reports",
  requireAdminSession,
  requireAdminPortalRole("BUG_REPORTS"),
  listBugReports
);
router.patch(
  "/bug-reports/:id",
  requireAdminSession,
  requireAdminPortalRole("BUG_REPORTS"),
  updateBugReportStatus
);

export default router;

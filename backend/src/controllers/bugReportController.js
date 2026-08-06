import { prisma } from "../config/database.js";
import { uploadBugScreenshotBase64 } from "../config/cloudinary.js";
import { sendBrevoEmail } from "../services/brevoService.js";
import { sendTransactionalEmail } from "../services/emailService.js";
import {
  buildBugReportAlertEmailHtml,
  buildBugReportAlertEmailText,
} from "../templates/bugReportEmail.js";
import { listBugReportAlertRecipients } from "../utils/bugReportAlertRecipients.js";

const VALID_CATEGORIES = ["BUG", "LOGIN", "COURSE", "DISPATCH", "OTHER"];
const VALID_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"];
const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REPORTS_PER_WINDOW = 5;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;

function normalizeCategory(value) {
  const key = String(value ?? "BUG")
    .trim()
    .toUpperCase();
  return VALID_CATEGORIES.includes(key) ? key : "BUG";
}

function formatCategoryLabel(category) {
  const labels = {
    BUG: "Bug / Error",
    LOGIN: "Login / Access",
    COURSE: "Course / Learning",
    DISPATCH: "The Dispatch",
    OTHER: "Other",
  };
  return labels[category] ?? category;
}

function estimateBase64Bytes(value) {
  const base64 = String(value).split(",")[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

async function resolveScreenshotUrl(screenshotBase64) {
  if (!screenshotBase64?.trim()) return null;

  const trimmed = screenshotBase64.trim();
  if (!/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(trimmed)) {
    throw new Error("Screenshot must be a JPEG, PNG, WebP, or GIF image");
  }

  if (estimateBase64Bytes(trimmed) > MAX_SCREENSHOT_BYTES) {
    throw new Error("Screenshot must be 5 MB or smaller");
  }

  const upload = await uploadBugScreenshotBase64(trimmed);
  if (!upload.success) {
    throw new Error(upload.error || "Failed to upload screenshot");
  }

  return upload.url;
}

async function sendBugReportAlertEmails(report) {
  const recipients = await listBugReportAlertRecipients(prisma);
  if (recipients.length === 0) {
    console.warn("[bugReport] No alert recipients configured — skipping email");
    return;
  }

  const submittedAt = new Date(report.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/+$/, "") || "http://localhost:3000";
  const adminPortalUrl = `${frontendUrl}/admin/bug-reports`;

  const emailPayload = {
    studentName: report.userName,
    studentEmail: report.userEmail,
    category: formatCategoryLabel(report.category),
    title: report.title,
    description: report.description,
    pageUrl: report.pageUrl,
    screenshotUrl: report.screenshotUrl,
    reportId: report.id,
    submittedAt,
    adminPortalUrl,
  };

  const subject = `[GenValue LMS] Bug report — ${report.title}`;
  const htmlContent = buildBugReportAlertEmailHtml(emailPayload);
  const textContent = buildBugReportAlertEmailText(emailPayload);

  await Promise.allSettled(
    recipients.map(async (admin) => {
      const params = {
        to: { email: admin.email, name: admin.name || admin.email.split("@")[0] },
        subject,
        htmlContent,
        textContent,
      };

      const smtpResult = await sendTransactionalEmail(params);
      if (smtpResult.ok) return;

      const apiResult = await sendBrevoEmail(params);
      if (!apiResult.ok) {
        console.warn(`[bugReport] Alert email failed for ${admin.email}:`, apiResult.message);
      }
    })
  );
}

/**
 * POST /api/v1/bug-reports — student submits a bug report
 */
export async function submitBugReport(req, res) {
  try {
    const { category, title, description, pageUrl, screenshotBase64 } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    if (!description?.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Title must be ${MAX_TITLE_LENGTH} characters or fewer`,
      });
    }

    if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`,
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.uid },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!dbUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recentCount = await prisma.bugReport.count({
      where: {
        userId: dbUser.id,
        createdAt: { gte: windowStart },
      },
    });

    if (recentCount >= MAX_REPORTS_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        message: "Too many reports submitted recently. Please try again in an hour.",
      });
    }

    let screenshotUrl = null;
    try {
      screenshotUrl = await resolveScreenshotUrl(screenshotBase64);
    } catch (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError.message || "Invalid screenshot",
      });
    }

    const report = await prisma.bugReport.create({
      data: {
        userId: dbUser.id,
        userEmail: dbUser.email,
        userName: dbUser.name,
        category: normalizeCategory(category),
        title: trimmedTitle,
        description: trimmedDescription,
        pageUrl: pageUrl?.trim()?.slice(0, 500) || null,
        screenshotUrl,
        userAgent: req.headers["user-agent"]?.slice(0, 500) || null,
      },
    });

    sendBugReportAlertEmails(report).catch((error) => {
      console.warn("[bugReport] Alert email dispatch error:", error.message);
    });

    res.status(201).json({
      success: true,
      message: "Bug report submitted. Our team has been notified.",
      data: {
        id: report.id,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error("[bugReport] submitBugReport error:", error);
    res.status(500).json({ success: false, message: "Failed to submit bug report" });
  }
}

/**
 * GET /api/v1/admin/bug-reports
 */
export async function listBugReports(req, res) {
  try {
    const status = req.query.status?.toString().toUpperCase();
    const where = status && VALID_STATUSES.includes(status) ? { status } : {};

    const [reports, openCount, inProgressCount, totalCount] = await Promise.all([
      prisma.bugReport.findMany({
        where,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 200,
      }),
      prisma.bugReport.count({ where: { status: "OPEN" } }),
      prisma.bugReport.count({ where: { status: "IN_PROGRESS" } }),
      prisma.bugReport.count(),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: {
        total: totalCount,
        filtered: reports.length,
        openCount,
        inProgressCount,
      },
    });
  } catch (error) {
    console.error("[bugReport] listBugReports error:", error);
    res.status(500).json({ success: false, message: "Failed to load bug reports" });
  }
}

/**
 * PATCH /api/v1/admin/bug-reports/:id
 */
export async function updateBugReportStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !VALID_STATUSES.includes(String(status).toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (OPEN, IN_PROGRESS, RESOLVED)",
      });
    }

    const normalizedStatus = String(status).toUpperCase();
    const existing = await prisma.bugReport.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: "Bug report not found" });
    }

    const updated = await prisma.bugReport.update({
      where: { id },
      data: {
        status: normalizedStatus,
        ...(adminNotes !== undefined
          ? { adminNotes: adminNotes?.trim()?.slice(0, 2000) || null }
          : {}),
        ...(normalizedStatus === "RESOLVED"
          ? {
              resolvedAt: new Date(),
              resolvedByEmail: req.admin.email,
            }
          : normalizedStatus !== "RESOLVED" && existing.status === "RESOLVED"
            ? { resolvedAt: null, resolvedByEmail: null }
            : {}),
      },
    });

    res.json({
      success: true,
      message: "Bug report updated",
      data: updated,
    });
  } catch (error) {
    console.error("[bugReport] updateBugReportStatus error:", error);
    res.status(500).json({ success: false, message: "Failed to update bug report" });
  }
}

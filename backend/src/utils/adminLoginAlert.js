import { sendBrevoEmail } from "../services/brevoService.js";
import { sendTransactionalEmail } from "../services/emailService.js";
import {
  buildAdminLoginAlertEmailHtml,
  buildAdminLoginAlertEmailText,
} from "../templates/adminLoginAlertEmail.js";

function formatAdminRoleLabel({ isSuperAdmin, roles = [] }) {
  if (isSuperAdmin) return "Super Admin";
  if (roles.length === 0) return "Admin";
  return roles.join(", ");
}

/**
 * Send a sign-in alert to the admin who just authenticated via OTP.
 */
export async function sendAdminLoginAlertEmail({
  email,
  name,
  isSuperAdmin,
  roles,
  ipAddress,
  userAgent,
  loginAt = new Date(),
}) {
  const frontendUrl =
    process.env.FRONTEND_URL?.trim().replace(/\/+$/, "") || "http://localhost:3000";
  const adminPortalUrl = `${frontendUrl}/admin/auth/login`;

  const loginAtFormatted = loginAt.toLocaleString(undefined, {
    weekday: "long",
    dateStyle: "full",
    timeStyle: "long",
  });

  const displayName = name || email.split("@")[0];
  const payload = {
    adminName: displayName,
    adminEmail: email,
    roleLabel: formatAdminRoleLabel({ isSuperAdmin, roles }),
    loginAt: loginAtFormatted,
    ipAddress: ipAddress || "Unknown",
    userAgent: userAgent?.slice(0, 500) || "Not available",
    adminPortalUrl,
  };

  const params = {
    to: { email, name: displayName },
    subject: `[GenValue Admin] Sign-in alert — ${loginAt.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })}`,
    htmlContent: buildAdminLoginAlertEmailHtml(payload),
    textContent: buildAdminLoginAlertEmailText(payload),
  };

  const smtpResult = await sendTransactionalEmail(params);
  if (smtpResult.ok) return { ok: true, channel: smtpResult.channel };

  const apiResult = await sendBrevoEmail(params);
  if (!apiResult.ok) {
    console.warn("[adminLoginAlert] email failed:", apiResult.message);
    return { ok: false, message: apiResult.message };
  }

  return { ok: true, channel: apiResult.channel };
}

export function getClientIpFromRequest(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).trim();
  }
  return req.socket?.remoteAddress || req.ip || "Unknown";
}

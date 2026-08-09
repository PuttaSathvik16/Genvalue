import { prisma } from "../config/database.js";
import { sendBrevoEmail } from "../services/brevoService.js";
import { sendTransactionalEmail } from "../services/emailService.js";
import {
  buildAdminLoginAlertEmailHtml,
  buildAdminLoginAlertEmailText,
} from "../templates/adminLoginAlertEmail.js";

const CONTACT_EMAIL =
  process.env.BREVO_TEAM_EMAIL?.trim() ||
  process.env.CONTACT_INBOX_EMAIL?.trim() ||
  "genvalue.academy@gmail.com";

const SUPER_ADMIN_EMAIL =
  process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() || "sujithputta02@gmail.com";

function formatAdminRoleLabel({ isSuperAdmin, roles = [] }) {
  if (isSuperAdmin) return "Super Admin";
  if (roles.length === 0) return "Admin";
  return roles.join(", ");
}

function formatLoginParts(loginAt) {
  const date = loginAt.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const time = loginAt.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    timeZone: "Asia/Kolkata",
  });
  return { date, time };
}

async function resolveAlertRecipients(actorEmail) {
  const byEmail = new Map();
  const normalizedActor = actorEmail.trim().toLowerCase();
  byEmail.set(normalizedActor, { email: normalizedActor, kind: "actor" });

  if (SUPER_ADMIN_EMAIL) {
    byEmail.set(SUPER_ADMIN_EMAIL, {
      email: SUPER_ADMIN_EMAIL,
      kind: SUPER_ADMIN_EMAIL === normalizedActor ? "actor" : "watcher",
    });
  }

  try {
    const supers = await prisma.authorizedAdmin.findMany({
      where: { isActive: true, isSuperAdmin: true },
      select: { email: true },
    });
    for (const row of supers) {
      const email = row.email.trim().toLowerCase();
      if (!email) continue;
      if (byEmail.has(email)) continue;
      byEmail.set(email, {
        email,
        kind: email === normalizedActor ? "actor" : "watcher",
      });
    }
  } catch (error) {
    console.warn("[adminLoginAlert] could not load super admins:", error.message);
  }

  return [...byEmail.values()];
}

async function deliverAlertEmail(params) {
  const smtpResult = await sendTransactionalEmail(params);
  if (smtpResult.ok) return { ok: true, channel: smtpResult.channel };

  const apiResult = await sendBrevoEmail(params);
  if (!apiResult.ok) {
    return { ok: false, message: apiResult.message };
  }
  return { ok: true, channel: apiResult.channel };
}

/**
 * Send a sign-in security alert to the admin who authenticated
 * and every active super admin (deduped).
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
  const { date: loginDate, time: loginTime } = formatLoginParts(loginAt);
  const displayName = (name && String(name).trim()) || email.split("@")[0];
  const roleLabel = formatAdminRoleLabel({ isSuperAdmin, roles });
  const recipients = await resolveAlertRecipients(email);

  const subject = `[GenValue] Security Alert — Admin login ${loginAt.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  })}`;

  const results = [];

  for (const recipient of recipients) {
    const payload = {
      adminName: displayName,
      adminEmail: email.trim().toLowerCase(),
      roleLabel,
      loginDate,
      loginTime,
      ipAddress: ipAddress || "Unknown",
      userAgent: userAgent?.slice(0, 500) || "Not available",
      recipientKind: recipient.kind,
      contactEmail: CONTACT_EMAIL,
    };

    const params = {
      to: {
        email: recipient.email,
        name: recipient.kind === "actor" ? displayName : "GenValue Super Admin",
      },
      subject,
      htmlContent: buildAdminLoginAlertEmailHtml(payload),
      textContent: buildAdminLoginAlertEmailText(payload),
    };

    const result = await deliverAlertEmail(params);
    if (!result.ok) {
      console.warn(
        `[adminLoginAlert] failed for ${recipient.email}:`,
        result.message
      );
    }
    results.push({ email: recipient.email, ...result });
  }

  const anyOk = results.some((r) => r.ok);
  if (!anyOk) {
    return {
      ok: false,
      message: results[0]?.message || "Failed to send login alert emails",
      results,
    };
  }

  return { ok: true, results };
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

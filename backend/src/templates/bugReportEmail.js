import { escapeHtml } from "../utils/htmlEscape.js";

export function buildBugReportAlertEmailHtml({
  studentName,
  studentEmail,
  category,
  title,
  description,
  pageUrl,
  screenshotUrl,
  reportId,
  submittedAt,
  adminPortalUrl,
}) {
  const safeName = escapeHtml(studentName);
  const safeEmail = escapeHtml(studentEmail);
  const safeCategory = escapeHtml(category);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description).replace(/\n/g, "<br />");
  const safePageUrl = pageUrl ? escapeHtml(pageUrl) : "Not provided";
  const safeScreenshotUrl = screenshotUrl ? escapeHtml(screenshotUrl) : null;
  const safeReportId = escapeHtml(reportId);
  const safeSubmittedAt = escapeHtml(submittedAt);
  const safeAdminUrl = escapeHtml(adminPortalUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GenValue Academy — Student Bug Report Alert</title>
</head>
<body style="margin:0;padding:0;background-color:#EDE6D3;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#EDE6D3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#F6F1E4;border:1px solid rgba(0,0,0,0.1);border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(13,27,42,0.12);">
          <tr>
            <td style="background-color:#0D1B2A;padding:28px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#F59E0B;">⚠ LMS BUG REPORT</p>
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.2;">
                <span style="color:#ffffff;">Gen</span><span style="color:#60A5FA;">Value</span>
                <span style="display:block;font-size:13px;font-weight:600;color:#94A3B8;margin-top:6px;">Student issue needs review</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#6B6558;">
                A student reported a problem in the LMS. This alert was sent to the technical team
                (Super Admin, CTO, CPO) — not Founder, Co-founder, or Instructor roles.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;background:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);">
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid rgba(0,0,0,0.06);">
                    <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6B6558;">Student</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#2A2A28;">${safeName}</p>
                    <p style="margin:2px 0 0;font-size:12px;color:#6B6558;">${safeEmail}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid rgba(0,0,0,0.06);">
                    <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6B6558;">Issue type</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#2A2A28;">${safeCategory}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6B6558;">Submitted</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#2A2A28;">${safeSubmittedAt}</p>
                    <p style="margin:8px 0 0;font-size:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#6B6558;">ID: ${safeReportId}</p>
                  </td>
                </tr>
              </table>

              <div style="padding:18px;background:#ffffff;border-radius:16px;border:1px dashed rgba(30,63,224,0.22);margin-bottom:20px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6B6558;">Report title</p>
                <p style="margin:0 0 16px;font-size:16px;font-weight:800;color:#2A2A28;">${safeTitle}</p>
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#6B6558;">Description</p>
                <p style="margin:0;font-size:14px;line-height:1.65;color:#2A2A28;">${safeDescription}</p>
              </div>

              <p style="margin:0 0 20px;font-size:12px;line-height:1.5;color:#6B6558;">
                <strong style="color:#2A2A28;">Page URL:</strong> ${safePageUrl}
              </p>

              ${
                safeScreenshotUrl
                  ? `<p style="margin:0 0 20px;font-size:12px;line-height:1.5;color:#6B6558;">
                <strong style="color:#2A2A28;">Screenshot:</strong>
                <a href="${safeScreenshotUrl}" style="color:#1E3FE0;">View attached screenshot</a>
              </p>`
                  : ""
              }

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:999px;background:#1E3FE0;">
                    <a href="${safeAdminUrl}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
                      Open Bug Reports in Admin Portal
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;font-size:11px;line-height:1.5;color:#6B6558;text-align:center;">
                Sign in with your authorized admin email to review and update status.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;text-align:center;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:11px;color:#6B6558;">GenValue Academy · Automated LMS alert</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildBugReportAlertEmailText({
  studentName,
  studentEmail,
  category,
  title,
  description,
  pageUrl,
  screenshotUrl,
  reportId,
  submittedAt,
  adminPortalUrl,
}) {
  return [
    "GenValue Academy — Student Bug Report Alert",
    "",
    "A student reported an issue in the LMS.",
    "Recipients: Super Admin, CTO, CPO (not Founder, Co-founder, or Instructor).",
    "",
    `Student: ${studentName} (${studentEmail})`,
    `Issue type: ${category}`,
    `Submitted: ${submittedAt}`,
    `Report ID: ${reportId}`,
    "",
    `Title: ${title}`,
    "",
    description,
    "",
    `Page URL: ${pageUrl || "Not provided"}`,
    screenshotUrl ? `Screenshot: ${screenshotUrl}` : "",
    "",
    `Review in admin portal: ${adminPortalUrl}`,
  ].join("\n");
}

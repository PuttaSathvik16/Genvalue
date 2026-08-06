import { escapeHtml } from "../utils/htmlEscape.js";

const SECURITY_PRECAUTIONS = [
  "If you did not sign in, contact genvalue.academy@gmail.com immediately and revoke access from Authorized Admins.",
  "Never share your OTP code or admin session with anyone — GenValue staff will never ask for it.",
  "Sign out when you finish, especially on shared or public devices.",
  "Use only your authorized admin email; do not forward portal links or tokens.",
  "Review the Portal Security page after login and report anything unusual.",
];

export function buildAdminLoginAlertEmailHtml({
  adminName,
  adminEmail,
  roleLabel,
  loginAt,
  ipAddress,
  userAgent,
  adminPortalUrl,
}) {
  const safeName = escapeHtml(adminName);
  const safeEmail = escapeHtml(adminEmail);
  const safeRole = escapeHtml(roleLabel);
  const safeLoginAt = escapeHtml(loginAt);
  const safeIp = escapeHtml(ipAddress || "Unknown");
  const safeUserAgent = escapeHtml(userAgent || "Not available");
  const safePortalUrl = escapeHtml(adminPortalUrl);

  const precautionItems = SECURITY_PRECAUTIONS.map(
    (item) =>
      `<li style="margin:0 0 10px;font-size:13px;line-height:1.55;color:#2A2A28;">${escapeHtml(item)}</li>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>GenValue Admin Portal — Sign-in Alert</title>
</head>
<body style="margin:0;padding:0;background-color:#EDE6D3;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#EDE6D3;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#F6F1E4;border:1px solid rgba(0,0,0,0.1);border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(13,27,42,0.12);">
          <tr>
            <td style="background-color:#0D1B2A;padding:28px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#10B981;">✓ ADMIN SIGN-IN</p>
              <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.2;">
                <span style="color:#ffffff;">Gen</span><span style="color:#60A5FA;">Value</span>
                <span style="display:block;font-size:13px;font-weight:600;color:#94A3B8;margin-top:6px;">Portal access confirmed</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#2A2A28;">
                Hello <strong>${safeName}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#6B6558;">
                You successfully signed in to the GenValue Academy admin portal. This is a security
                notification for your records.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px;background:#ffffff;border-radius:16px;border:1px solid rgba(0,0,0,0.06);">
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid rgba(0,0,0,0.06);">
                    <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6B6558;">Signed in at</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:#2A2A28;">${safeLoginAt}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;border-bottom:1px solid rgba(0,0,0,0.06);">
                    <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6B6558;">Account</p>
                    <p style="margin:4px 0 0;font-size:14px;font-weight:700;color:#2A2A28;">${safeEmail}</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#6B6558;">Role: ${safeRole}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6B6558;">Session details</p>
                    <p style="margin:4px 0 0;font-size:12px;color:#2A2A28;"><strong>IP:</strong> ${safeIp}</p>
                    <p style="margin:8px 0 0;font-size:11px;line-height:1.45;color:#6B6558;word-break:break-word;">${safeUserAgent}</p>
                  </td>
                </tr>
              </table>

              <div style="padding:18px;background:#FEF3C7;border-radius:16px;border:1px solid rgba(245,158,11,0.35);margin-bottom:20px;">
                <p style="margin:0 0 12px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;color:#B45309;">Security precautions</p>
                <ul style="margin:0;padding-left:18px;">${precautionItems}</ul>
              </div>

              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                <tr>
                  <td style="border-radius:999px;background:#1E3FE0;">
                    <a href="${safePortalUrl}" style="display:inline-block;padding:14px 28px;font-size:13px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.02em;">
                      Open Admin Portal
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;text-align:center;border-top:1px solid rgba(0,0,0,0.06);">
              <p style="margin:0;font-size:11px;color:#6B6558;">GenValue Academy · Automated security alert</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildAdminLoginAlertEmailText({
  adminName,
  adminEmail,
  roleLabel,
  loginAt,
  ipAddress,
  userAgent,
  adminPortalUrl,
}) {
  return [
    "GenValue Academy — Admin Portal Sign-in Alert",
    "",
    `Hello ${adminName},`,
    "",
    "You successfully signed in to the GenValue Academy admin portal.",
    "",
    `Signed in at: ${loginAt}`,
    `Account: ${adminEmail}`,
    `Role: ${roleLabel}`,
    `IP address: ${ipAddress || "Unknown"}`,
    `Device / browser: ${userAgent || "Not available"}`,
    "",
    "Security precautions:",
    ...SECURITY_PRECAUTIONS.map((item) => `- ${item}`),
    "",
    `Admin portal: ${adminPortalUrl}`,
  ].join("\n");
}

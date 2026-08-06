/**
 * Contact-form email only (Brevo SMTP).
 * Intentionally separate from admin/OTP/backend mail so those paths stay untouched.
 */
import nodemailer from "nodemailer";
import type { BrevoSendResult, SendBrevoEmailParams } from "@/lib/brevo";

function smtpConfig() {
  return {
    host: process.env.BREVO_SMTP_HOST?.trim() || "smtp-relay.brevo.com",
    port: Number(process.env.BREVO_SMTP_PORT || 587),
    user: process.env.BREVO_SMTP_USER?.trim(),
    pass: process.env.BREVO_SMTP_KEY?.trim(),
    senderEmail: process.env.BREVO_SENDER_EMAIL?.trim(),
    senderName: process.env.BREVO_SENDER_NAME?.trim() || "GenValue Academy",
  };
}

/**
 * Sends one contact-form email via Brevo SMTP (works without REST API IP whitelist).
 */
export async function sendContactFormEmail(
  params: SendBrevoEmailParams,
): Promise<BrevoSendResult> {
  const config = smtpConfig();

  if (!config.senderEmail) {
    return { ok: false, status: 500, message: "BREVO_SENDER_EMAIL is not set" };
  }
  if (!config.user || !config.pass) {
    return {
      ok: false,
      status: 500,
      message: "BREVO_SMTP_KEY / BREVO_SMTP_USER is not set",
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });

  try {
    await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: params.to.map((r) => (r.name ? `"${r.name}" <${r.email.trim()}>` : r.email.trim())).join(", "),
      subject: params.subject,
      html: params.htmlContent,
      text: params.textContent,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[contact-email] SMTP send failed:", message);
    return { ok: false, status: 502, message: message.slice(0, 800) };
  }
}

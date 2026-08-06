import nodemailer from "nodemailer";
import { sendBrevoEmail } from "./brevoService.js";

function getEmailConfig() {
  return {
    smtpHost: process.env.BREVO_SMTP_HOST?.trim() || "smtp-relay.brevo.com",
    smtpPort: Number(process.env.BREVO_SMTP_PORT || 587),
    brevoSmtpUser: process.env.BREVO_SMTP_USER?.trim(),
    brevoSmtpKey: process.env.BREVO_SMTP_KEY?.trim(),
    gmailUser: process.env.GMAIL_USER?.trim(),
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD?.trim(),
    senderEmail: process.env.BREVO_SENDER_EMAIL?.trim(),
    senderName: process.env.BREVO_SENDER_NAME?.trim() || "GenValue Academy",
    /** When true (default if SMTP key exists), skip Brevo REST API — works from any IP. */
    smtpOnly:
      process.env.BREVO_EMAIL_MODE?.trim() === "smtp-only" ||
      (process.env.BREVO_EMAIL_MODE?.trim() !== "api" &&
        Boolean(process.env.BREVO_SMTP_KEY?.trim())),
    devConsole: process.env.ADMIN_OTP_DEV_CONSOLE === "true",
    isDev: process.env.NODE_ENV !== "production",
  };
}

function createTransporter({ host, port, user, pass }) {
  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
  });
}

async function sendWithTransporter(transporter, params, config, channel) {
  if (!config.senderEmail) {
    return { ok: false, message: "BREVO_SENDER_EMAIL is not set", channel };
  }

  try {
    await transporter.sendMail({
      from: `"${config.senderName}" <${config.senderEmail}>`,
      to: params.to.email.trim(),
      subject: params.subject,
      html: params.htmlContent,
      text: params.textContent,
    });

    return { ok: true, channel };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, message, channel };
  }
}

async function sendViaBrevoSmtp(params, config) {
  const user = config.brevoSmtpUser;

  if (!user || !config.brevoSmtpKey) {
    return {
      ok: false,
      message: "Brevo SMTP not configured (BREVO_SMTP_KEY / BREVO_SMTP_USER)",
      channel: "brevo-smtp",
    };
  }

  const transporter = createTransporter({
    host: config.smtpHost,
    port: config.smtpPort,
    user,
    pass: config.brevoSmtpKey,
  });

  const result = await sendWithTransporter(transporter, params, config, "brevo-smtp");

  if (!result.ok) {
    return {
      ...result,
      hint:
        "Check BREVO_SMTP_KEY matches the xsmtpsib key in Brevo → SMTP & API. Regenerate if needed.",
    };
  }

  return result;
}

async function sendViaGmail(params, config) {
  const transporter = createTransporter({
    host: "smtp.gmail.com",
    port: 587,
    user: config.gmailUser,
    pass: config.gmailAppPassword,
  });

  if (!transporter) {
    return { ok: false, message: "Gmail SMTP not configured", channel: "gmail" };
  }

  return sendWithTransporter(transporter, params, config, "gmail");
}

function sendViaDevConsole(params, config) {
  if (!config.isDev || !config.devConsole) {
    return null;
  }

  const otpMatch = params.textContent?.match(/\b(\d{6})\b/);

  console.log("\n========================================");
  console.log("[DEV] Admin OTP (server only — not sent to browser)");
  console.log(`[DEV] To: ${params.to.email}`);
  if (otpMatch) {
    console.log(`[DEV] Code: ${otpMatch[1]}`);
  }
  console.log("[DEV] Set ADMIN_OTP_DEV_CONSOLE=false once email is working.");
  console.log("========================================\n");

  return { ok: true, channel: "dev-console" };
}

/**
 * Send transactional email — tries Brevo SMTP, Gmail SMTP, Brevo API, then dev console.
 */
export async function sendTransactionalEmail(params) {
  const config = getEmailConfig();
  const errors = [];

  if (config.brevoSmtpKey) {
    const smtpResult = await sendViaBrevoSmtp(params, config);
    if (smtpResult.ok) {
      return smtpResult;
    }
    console.error("[emailService] Brevo SMTP failed:", smtpResult.message);
    errors.push(`Brevo SMTP: ${smtpResult.message}`);
  }

  if (config.gmailUser && config.gmailAppPassword) {
    const gmailResult = await sendViaGmail(params, config);
    if (gmailResult.ok) {
      return gmailResult;
    }
    console.error("[emailService] Gmail SMTP failed:", gmailResult.message);
    errors.push(`Gmail: ${gmailResult.message}`);
  }

  if (!config.smtpOnly) {
    const apiResult = await sendBrevoEmail(params);
    if (apiResult.ok) {
      return { ok: true, channel: "brevo-api" };
    }
    console.error("[emailService] Brevo API failed:", apiResult.message);
    errors.push(`Brevo API: ${apiResult.message}`);
  }

  const devResult = sendViaDevConsole(params, config);
  if (devResult?.ok) {
    return devResult;
  }

  const isIpBlocked = errors.some(
    (e) => e.includes("unrecognised IP") || e.includes("unauthorized")
  );
  const isSmtpAuth = errors.some((e) => e.includes("Authentication failed"));

  let hint =
    "Fix email delivery in backend/.env. See backend/scripts/test-smtp.js";

  if (isSmtpAuth) {
    hint =
      "Brevo SMTP login is wrong. In Brevo → SMTP & API, copy the SMTP Login and set BREVO_SMTP_USER (use xsmtpsib key as BREVO_SMTP_KEY). SMTP works from any IP — no whitelist needed.";
  } else if (isIpBlocked) {
    hint =
      "Brevo API requires IP whitelisting. Use SMTP instead: set BREVO_SMTP_KEY + correct BREVO_SMTP_USER (BREVO_EMAIL_MODE=smtp-only is default).";
  }

  return {
    ok: false,
    message: errors.join(" | "),
    hint,
  };
}

export async function verifySmtpConnection() {
  const config = getEmailConfig();
  const user = config.brevoSmtpUser;

  if (!user || !config.brevoSmtpKey) {
    return { ok: false, message: "Brevo SMTP not configured" };
  }

  const ports = [config.smtpPort, config.smtpPort === 587 ? 465 : 587];

  for (const port of [...new Set(ports)]) {
    const transporter = createTransporter({
      host: config.smtpHost,
      port,
      user,
      pass: config.brevoSmtpKey,
    });

    if (!transporter) {
      continue;
    }

    try {
      await transporter.verify();
      return { ok: true, user, port };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (port === ports[ports.length - 1]) {
        return { ok: false, message, user };
      }
    }
  }

  return { ok: false, message: "SMTP verification failed", user };
}

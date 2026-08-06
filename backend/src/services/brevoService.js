const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Sends one transactional email via Brevo (SMTP API).
 */
export async function sendBrevoEmail({ to, subject, htmlContent, textContent }) {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || "GenValue Academy";

  if (!apiKey) {
    return { ok: false, message: "BREVO_API_KEY is not set" };
  }
  if (!senderEmail) {
    return { ok: false, message: "BREVO_SENDER_EMAIL is not set" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(BREVO_SMTP_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to.email.trim(), ...(to.name ? { name: to.name } : {}) }],
        subject,
        htmlContent,
        ...(textContent ? { textContent } : {}),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      let message = await response.text();
      try {
        const parsed = JSON.parse(message);
        if (parsed.message) {
          message = [parsed.code, parsed.message].filter(Boolean).join(": ");
        }
      } catch {
        /* keep raw */
      }
      return { ok: false, message: message.slice(0, 800), status: response.status };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

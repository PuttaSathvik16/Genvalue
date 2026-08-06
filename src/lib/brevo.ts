const BREVO_SMTP_URL = "https://api.brevo.com/v3/smtp/email";

export type BrevoRecipient = {
  readonly email: string;
  readonly name?: string;
};

export type SendBrevoEmailParams = {
  readonly to: readonly BrevoRecipient[];
  readonly subject: string;
  readonly htmlContent: string;
  readonly textContent?: string;
};

export type BrevoSendResult =
  | { ok: true }
  | { ok: false; status: number; message: string; brevoStatus?: number };

/**
 * Sends one transactional email via Brevo (SMTP API).
 * Requires `BREVO_API_KEY` and `BREVO_SENDER_EMAIL` (verified sender in Brevo).
 */
export async function sendBrevoTransactionalEmail(params: SendBrevoEmailParams): Promise<BrevoSendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? "GenValue";

  if (!apiKey?.trim()) {
    return { ok: false, status: 500, message: "BREVO_API_KEY is not set" };
  }
  if (!senderEmail?.trim()) {
    return { ok: false, status: 500, message: "BREVO_SENDER_EMAIL is not set" };
  }

  try {
    const res = await fetch(BREVO_SMTP_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": apiKey.trim(),
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail.trim() },
        to: params.to.map((r) => ({ email: r.email.trim(), ...(r.name ? { name: r.name } : {}) })),
        subject: params.subject,
        htmlContent: params.htmlContent,
        ...(params.textContent ? { textContent: params.textContent } : {}),
      }),
    });

    const brevoStatus = res.status;

    if (!res.ok) {
      let message = await res.text();
      try {
        const j = JSON.parse(message) as { message?: string; code?: string };
        if (j.message) message = [j.code, j.message].filter(Boolean).join(": ");
      } catch {
        /* keep raw text */
      }
      return {
        ok: false,
        status: brevoStatus >= 400 && brevoStatus < 600 ? brevoStatus : 502,
        message: message.slice(0, 800),
        brevoStatus,
      };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[brevo] fetch error:", err);
    return { ok: false, status: 502, message: `Network error: ${message}` };
  }
}

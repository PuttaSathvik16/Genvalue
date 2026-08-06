import { sendContactFormEmail } from "@/lib/contact-email";
import { contactFormSchema } from "@/lib/contact-schema";
import { SITE } from "@/lib/constants";
import { escapeHtml } from "@/lib/html-escape";
import { NextResponse } from "next/server";

function buildTeamEmailHtml(data: {
  fullName: string;
  email: string;
  phone: string;
  courseInterest: string;
  message: string;
}): string {
  const phoneDisplay = data.phone.trim() || "-";
  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;">
  <h2 style="margin-top:0;">New contact form - GenValue</h2>
  <table style="border-collapse:collapse;max-width:560px;">
    <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Name</td><td style="padding:6px 0;">${escapeHtml(data.fullName)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Email</td><td style="padding:6px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
    <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Phone</td><td style="padding:6px 0;">${escapeHtml(phoneDisplay)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;font-weight:600;">Course interest</td><td style="padding:6px 0;">${escapeHtml(data.courseInterest)}</td></tr>
  </table>
  <p style="font-weight:600;margin-top:20px;">Message</p>
  <p style="white-space:pre-wrap;margin:0;padding:12px;background:#f4f4f5;border-radius:8px;">${escapeHtml(data.message)}</p>
</body>
</html>`.trim();
}

function buildConfirmationHtml(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "there";
  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.6;color:#111;">
  <p>Hi ${escapeHtml(first)},</p>
  <p>Thank you for contacting <strong>GenValue</strong>. We&apos;ve received your message and will get back to you within <strong>24 hours</strong>.</p>
  <p>Best regards,<br />GenValue Team</p>
</body>
</html>`.trim();
}

function clientHint(): string {
  return `You can also email us directly at ${SITE.email}.`;
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const teamInbox = process.env.BREVO_TEAM_EMAIL?.trim() || SITE.email;

    const teamResult = await sendContactFormEmail({
      to: [{ email: teamInbox, name: "GenValue" }],
      subject: `Contact form: ${data.fullName}`,
      htmlContent: buildTeamEmailHtml(data),
      textContent: [
        "New contact form - GenValue",
        `Name: ${data.fullName}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone.trim() || "-"}`,
        `Course interest: ${data.courseInterest}`,
        "",
        "Message:",
        data.message,
      ].join("\n"),
    });

    if (!teamResult.ok) {
      const missingConfig =
        teamResult.message.includes("is not set") ||
        teamResult.message.includes("BREVO_SMTP") ||
        teamResult.message.includes("BREVO_SENDER_EMAIL");

      console.error("[api/contact] team email failed:", teamResult);

      if (missingConfig) {
        return NextResponse.json(
          {
            error:
              "This site’s email service isn’t configured yet (missing Brevo SMTP keys on the server). Ask the admin to add BREVO_SMTP_USER, BREVO_SMTP_KEY, and BREVO_SENDER_EMAIL.",
            hint: clientHint(),
            code: "EMAIL_NOT_CONFIGURED",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          error:
            "We couldn’t send your message through Brevo SMTP. Check that SMTP credentials are valid and the sender email is verified in Brevo.",
          hint: clientHint(),
          code: "BREVO_REJECTED",
        },
        { status: 502 },
      );
    }

    const confirmResult = await sendContactFormEmail({
      to: [{ email: data.email, name: data.fullName }],
      subject: "We received your message - GenValue",
      htmlContent: buildConfirmationHtml(data.fullName),
      textContent: [
        `Hi ${data.fullName.trim().split(/\s+/)[0] ?? "there"},`,
        "",
        "Thank you for contacting GenValue. We've received your message and will get back to you within 24 hours.",
        "",
        "Best regards,",
        "GenValue Team",
      ].join("\n"),
    });

    if (!confirmResult.ok) {
      console.error("[api/contact] confirmation email failed:", confirmResult);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/contact] unexpected error:", err);
    return NextResponse.json(
      {
        error: "Something went wrong on the server.",
        hint: clientHint(),
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}

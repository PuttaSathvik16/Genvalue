/**
 * Test Brevo SMTP credentials. Run: bun scripts/test-smtp.js
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { verifySmtpConnection } from "../src/services/emailService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env"), override: true });

const user = process.env.BREVO_SMTP_USER || process.env.SUPER_ADMIN_EMAIL;
console.log("Testing SMTP login as:", user || "(not set)");
console.log("SMTP key set:", Boolean(process.env.BREVO_SMTP_KEY));

const result = await verifySmtpConnection();

if (result.ok) {
  console.log("✅ SMTP connection successful for:", result.user);
} else {
  console.error("❌ SMTP failed:", result.message);
  console.error("\nFix: In Brevo → SMTP & API, copy the SMTP Login and set:");
  console.error("  BREVO_SMTP_USER=<your-brevo-smtp-login>");
  console.error("  BREVO_SMTP_KEY=<your-xsmtpsib-key>");
  process.exit(1);
}

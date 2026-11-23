import nodemailer from 'nodemailer';

// Sends emails over SMTP, which almost every email provider supports (Resend, Postmark,
// Amazon SES, SendGrid...). To change provider, change the SMTP_* values: no code changes.
// In development, emails go to Mailpit, a fake inbox that runs in Docker: open
// http://localhost:8025 to read them. Nothing reaches a real inbox.
//
// Like lib/auth.ts, this file reads process.env instead of importing env.ts, so tests can
// import the app without a .env. env.ts still checks these values when the API starts.

const port = Number(process.env.SMTP_PORT);

// The connection is only opened when the first email is sent, so importing this file is safe.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  // Port 465 is encrypted from the start. Port 587 starts plain and must switch to encryption
  // before the password is sent. Mailpit (1025) is on your machine and needs neither.
  secure: port === 465,
  requireTLS: port === 587,
  // Mailpit needs no login, real providers do
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

type Email = {
  to: string;
  subject: string;
  text: string; // shown by email apps that don't display HTML
  html: string;
};

export async function sendEmail(email: Email) {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, ...email });
}

// Makes text safe to put inside HTML, so a value like a link can't add its own tags.
export function escapeHtml(text: string) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

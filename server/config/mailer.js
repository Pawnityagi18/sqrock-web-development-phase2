import nodemailer from 'nodemailer';

const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (smtpConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else {
  console.warn('⚠️  SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — emails will be logged to the console instead of sent. Set these in .env for real email delivery (e.g. via Gmail app password, Brevo, or Mailtrap free tiers).');
}

// Sends an email if SMTP is configured; otherwise logs it so nothing is silently lost in dev.
export async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.log('\n📧 [DEV EMAIL — SMTP not configured, not actually sent]');
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body: ${text || html}\n`);
    return { sent: false, mode: 'console' };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `"WorkPulse" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text
  });
  return { sent: true, mode: 'smtp' };
}

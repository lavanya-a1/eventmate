const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const secrets = require('../config/secrets');

// ─── Transporter ──────────────────────────────────────────────────────────────
// Uses real SMTP when secrets are provided; falls back to Ethereal test account.
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (secrets.smtp.host && secrets.smtp.user) {
    transporter = nodemailer.createTransport({
      host: secrets.smtp.host,
      port: secrets.smtp.port,
      secure: secrets.smtp.secure,
      auth: {
        user: secrets.smtp.user,
        pass: secrets.smtp.pass,
      },
    });
  } else {
    // Create Ethereal test account (dev only)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    logger.info(`[Email] Using Ethereal test account: ${testAccount.user}`);
  }

  return transporter;
};

// ─── Templates ────────────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#0f172a; margin:0; padding:20px; }
  .card { max-width:560px; margin:0 auto; background:#1e293b; border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,0.1); }
  .header { background:linear-gradient(135deg,#7c3aed,#4f46e5); padding:32px; text-align:center; }
  .header h1 { color:#fff; font-size:22px; margin:0; }
  .body { padding:32px; color:#cbd5e1; line-height:1.7; }
  .body h2 { color:#fff; margin-top:0; }
  .btn { display:inline-block; background:#7c3aed; color:#fff!important; text-decoration:none; padding:12px 28px; border-radius:10px; font-weight:600; margin-top:16px; }
  .footer { padding:20px 32px; border-top:1px solid rgba(255,255,255,0.08); font-size:12px; color:#475569; text-align:center; }
</style>
</head>
<body>
<div class="card">
  <div class="header"><h1>EventMate</h1></div>
  ${content}
  <div class="footer">© ${new Date().getFullYear()} EventMate. All rights reserved.</div>
</div>
</body>
</html>`;

// ─── Public API ────────────────────────────────────────────────────────────────
const emailService = {
  /**
   * Send a plain custom email.
   */
  async sendMail({ to, subject, html, text }) {
    try {
      const t = await getTransporter();
      const info = await t.sendMail({
        from: secrets.emailFrom,
        to,
        subject,
        text: text || subject,
        html,
      });
      logger.info(`[Email] Sent to ${to} — ${subject} | MsgId: ${info.messageId}`);
      // Log Ethereal preview URL in dev
      if (nodemailer.getTestMessageUrl(info)) {
        logger.info(`[Email] Preview: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId };
    } catch (err) {
      logger.error(`[Email] Failed to send to ${to}: ${err.message}`);
      return { success: false, error: err.message };
    }
  },

  /**
   * Email verification link.
   */
  async sendVerificationEmail({ to, name, verificationUrl }) {
    const html = baseTemplate(`
      <div class="body">
        <h2>Verify Your Email</h2>
        <p>Hi ${name || 'there'}, thanks for signing up! Please verify your email address to get started.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${verificationUrl}" class="btn">Verify Email</a>
        </p>
        <p style="font-size:12px;color:#64748b">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </div>`);
    return this.sendMail({ to, subject: 'Verify your EventMate email', html });
  },

  /**
   * Event reminder email.
   */
  async sendReminder({ to, name, eventTitle, eventDate, eventVenue }) {
    const html = baseTemplate(`
      <div class="body">
        <h2>Hey ${name || 'Attendee'} 👋</h2>
        <p>This is a friendly reminder about your upcoming event:</p>
        <div style="background:rgba(124,58,237,0.1);border-left:4px solid #7c3aed;padding:16px;border-radius:8px;margin:16px 0">
          <strong style="color:#fff;font-size:18px;">${eventTitle}</strong><br/>
          <span>📅 ${new Date(eventDate).toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</span><br/>
          <span>📍 ${eventVenue || 'TBD'}</span>
        </div>
        <p>Don't forget to bring your QR ticket. See you there!</p>
      </div>`);
    return this.sendMail({ to, subject: `Reminder: ${eventTitle} is coming up!`, html });
  },

  /**
   * Booking confirmation email.
   */
  async sendBookingConfirmation({ to, name, eventTitle, bookingId, seats, amount, qrCode }) {
    const html = baseTemplate(`
      <div class="body">
        <h2>Booking Confirmed ✓</h2>
        <p>Hi ${name || 'there'}, your booking has been confirmed!</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="color:#64748b;padding:6px 0">Event</td><td style="color:#fff;font-weight:600">${eventTitle}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Booking ID</td><td style="color:#fff;font-family:monospace">${bookingId}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Seats</td><td style="color:#fff">${seats}</td></tr>
          <tr><td style="color:#64748b;padding:6px 0">Amount Paid</td><td style="color:#10b981;font-weight:700">$${amount}</td></tr>
        </table>
        <p style="font-size:12px;color:#64748b">Your QR ticket code: <code style="background:rgba(255,255,255,0.05);padding:2px 6px;border-radius:4px">${qrCode || bookingId}</code></p>
      </div>`);
    return this.sendMail({ to, subject: `Booking Confirmed: ${eventTitle}`, html });
  },

  /**
   * Broadcast notification email.
   */
  async sendBroadcast({ to, title, message }) {
    const html = baseTemplate(`
      <div class="body">
        <h2>${title}</h2>
        <p>${message}</p>
      </div>`);
    return this.sendMail({ to, subject: title, html });
  },
};

module.exports = emailService;

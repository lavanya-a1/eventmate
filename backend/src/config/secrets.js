/**
 * Centralised secrets configuration.
 *
 * All sensitive values are loaded here so they live in one place.
 * In production, swap the source from process.env to a proper
 * secrets manager (Render Secret Files, AWS Secrets Manager,
 * Azure Key Vault, etc.) — only this file needs to change.
 *
 * Usage:
 *   const secrets = require('./config/secrets');
 *   secrets.smtp.host   // SMTP_HOST
 */

const logger = require('../utils/logger');

// ─── Helper ────────────────────────────────────────────────────────────────────
/**
 * Read a value from the secrets source (process.env by default).
 * Logs a warning when a required key is missing.
 */
const get = (key, { required = false, fallback = undefined } = {}) => {
  const value = process.env[key] ?? fallback;
  if (required && !value) {
    logger.warn(`[Secrets] Missing required secret: ${key}`);
  }
  return value;
};

// ─── Exported secrets ──────────────────────────────────────────────────────────
const secrets = {
  // Database
  mongoUri: get('MONGO_URI', { required: true }),

  // Auth
  jwtSecret: get('JWT_SECRET', { required: true }),

  // Cloudinary
  cloudinary: {
    cloudName: get('CLOUDINARY_CLOUD_NAME'),
    apiKey: get('CLOUDINARY_API_KEY'),
    apiSecret: get('CLOUDINARY_API_SECRET'),
  },

  // SMTP / Email
  smtp: {
    host: get('SMTP_HOST'),
    port: parseInt(get('SMTP_PORT', { fallback: '587' }), 10),
    secure: get('SMTP_SECURE') === 'true',
    user: get('SMTP_USER'),
    pass: get('SMTP_PASS'),
  },

  emailFrom: get('EMAIL_FROM', {
    fallback: '"EventMate Admin" <admin@eventmate.io>',
  }),

  // CORS
  clientUrl: get('CLIENT_URL', { fallback: 'http://localhost:5173' }),

  // Server
  port: parseInt(get('PORT', { fallback: '5000' }), 10),
  nodeEnv: get('NODE_ENV', { fallback: 'development' }),
};

// ─── Validate critical secrets at startup ──────────────────────────────────────
const validateSecrets = () => {
  const critical = ['mongoUri', 'jwtSecret'];
  const missing = critical.filter((k) => !secrets[k]);
  if (missing.length) {
    logger.error(
      `[Secrets] CRITICAL — the following secrets are missing and the app may not function: ${missing.join(', ')}`
    );
  }

  // Warn if SMTP credentials are absent (email will fall back to Ethereal)
  if (!secrets.smtp.host || !secrets.smtp.user) {
    logger.info(
      '[Secrets] SMTP credentials not set — email will use Ethereal test account'
    );
  }
};

// Run validation once on import (after dotenv has loaded in server.js)
// Wrap in setImmediate so dotenv in server.js has a chance to execute first
// when this module is required at the top of a file.
setImmediate(validateSecrets);

module.exports = secrets;

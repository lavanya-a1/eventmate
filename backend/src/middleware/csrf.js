const crypto = require('crypto');

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const COOKIE_SAME_SITE = 'Strict';
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean);
const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

/**
 * CSRF protection using the double-submit cookie pattern.
 *
 * How it works:
 * 1. Server sets a random CSRF token in a non-httpOnly cookie (JS-readable).
 * 2. Client reads that cookie and sends it in the X-CSRF-Token header.
 * 3. Server verifies the header matches the cookie.
 * 4. An attacker on another origin can trigger the cookie to be sent,
 *    but cannot read it (same-origin policy) so they can't forge the header.
 */

/**
 * Set (or refresh) the CSRF cookie.
 * Call this after login / register / token refresh.
 */
function setCsrfCookie(res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,       // must be readable by JS
    secure: IS_PRODUCTION,
    sameSite: COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches refresh token)
    path: '/',
  });
  return token;
}

/**
 * Clear the CSRF cookie (call on logout).
 */
function clearCsrfCookie(res) {
  res.clearCookie(CSRF_COOKIE, {
    httpOnly: false,
    secure: IS_PRODUCTION,
    sameSite: COOKIE_SAME_SITE,
    path: '/',
  });
}

/**
 * Middleware: validate that the CSRF header matches the CSRF cookie.
 * Only apply to state-changing methods (POST, PUT, PATCH, DELETE).
 * Skip validation when no refresh-token cookie exists (user not logged in).
 */
function verifyCsrf(req, res, next) {
  // Skip non-state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip if user has no refresh token cookie (not using cookie-based auth)
  if (!req.cookies?.refreshToken) {
    return next();
  }

  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Request origin is not allowed',
    });
  }

  const cookieToken = req.cookies[CSRF_COOKIE];
  const headerToken = req.headers[CSRF_HEADER];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
    });
  }

  next();
}

module.exports = { setCsrfCookie, clearCsrfCookie, verifyCsrf };

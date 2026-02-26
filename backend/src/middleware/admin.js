/**
 * Admin-only guard middleware.
 * Must be used AFTER the `protect` auth middleware (which sets req.user).
 */
const Log = require('../models/Log');

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

/**
 * Activity logger middleware — persists a DB log entry after admin actions.
 * Usage: router.post('/events', protect, isAdmin, logActivity('Events', 'info'), handler)
 */
const logActivity = (module = 'Admin', level = 'info') => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    // Only log successful responses
    if (res.statusCode < 400) {
      const message = `[${req.method}] ${req.originalUrl} — ${req.user?.email || 'unknown'}`;
      Log.create({
        level,
        module,
        message,
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { body: req.body, params: req.params, query: req.query },
      }).catch(() => {}); // fire-and-forget — never block the response
    }
    return originalJson(data);
  };
  next();
};

module.exports = { isAdmin, logActivity };

const logger = require("../utils/logger");

const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      // Log internally for audit purposes without exposing to client
      logger.warn({
        action: "access_denied",
        requiredRoles: roles,
        userRole: req.user?.role,
        userId: req.user?.id,
        path: req.path,
      });
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};

module.exports = function (requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = roleMiddleware;


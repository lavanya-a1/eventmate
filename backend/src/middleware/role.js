const roleMiddleware = (roles) => {
  return (req, res, next) => {
    console.log("DEBUG: Required Roles:", roles);
    console.log("DEBUG: User Role:", req.user ? req.user.role : "No User");

    if (!req.user || !roles.includes(req.user.role)) {
      console.log("DEBUG: Access Denied. User role:", req.user ? req.user.role : "undefined");
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


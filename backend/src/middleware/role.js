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

module.exports = roleMiddleware;

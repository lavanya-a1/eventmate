const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader) {
    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({ message: "Token format invalid" });
    }

    const [scheme, bearerToken] = parts;

    if (scheme !== "Bearer") {
      return res.status(401).json({ message: "Token must start with Bearer" });
    }

    token = bearerToken;
  } else {
    token = req.cookies?.accessToken;
  }

  if (!token) {
    if (req.cookies?.refreshToken) {
      return res.status(401).json({ message: "Access token missing", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: "No auth token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Log the error internally without exposing details to client
    logger.error({ message: "JWT verification failed", error: err.message, stack: err.stack });
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired", code: "TOKEN_EXPIRED" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Export both default (backwards-compat for old routes) and named (for admin routes)
module.exports = protect;
module.exports.protect = protect;

const logger = require("../utils/logger");
const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  // Always log the full error internally for debugging
  logger.error({
    message: err.message,
    stack: err.stack,
    status: err.statusCode,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "Image upload failed: file size must be 5MB or less",
      });
    }

    return res.status(400).json({
      success: false,
      message: "File upload failed.",
    });
  }

  // Always return a safe generic message to client
  res.status(err.statusCode || 500).json({
    success: false,
    message: "An unexpected error occurred. Please try again later.",
  });
};

module.exports = errorHandler;

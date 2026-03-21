const logger = require("../utils/logger");
const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "Image upload failed: file size must be 5MB or less",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;

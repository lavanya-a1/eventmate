const express = require("express");
const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is healthy"
  });
});

module.exports = router;

const auth = require("../middleware/auth");

router.get("/protected", auth, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

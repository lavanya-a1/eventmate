const express = require("express");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const User = require("../models/User");
const auth = require("../middleware/auth");
const authController = require("../controllers/authController");

const router = express.Router();

// Stricter rate limits for auth endpoints to prevent brute-force / credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // 10 attempts per window per IP
  message: {
    success: false,
    message: "Too many attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/profile", auth, authController.updateProfile);
router.put("/password", auth, authController.updatePassword);
router.put("/updatedetails", auth, authController.updateDetails);

// ─── Google OAuth ──────────────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/?error=google_auth_failed" }),
  authController.googleCallback
);

module.exports = router;

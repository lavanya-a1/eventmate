const crypto = require("crypto");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");
const { setCsrfCookie, clearCsrfCookie } = require("../middleware/csrf");
const emailService = require("../services/emailService");
const secrets = require("../config/secrets");

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

async function generateRefreshToken(userId) {
  const raw = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    user: userId,
    token: raw,
    expiresAt,
  });

  return raw;
}

/**
 * Set the refresh token as an httpOnly cookie + CSRF cookie.
 */
function setAuthCookies(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
  setCsrfCookie(res);
}

function clearAuthCookies(res) {
  res.clearCookie('refreshToken', { path: '/' });
  clearCsrfCookie(res);
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  const hashed = await bcrypt.hash(password, 10);

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name,
    email,
    password: hashed,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  });

  // Send verification email (fire-and-forget — don't block registration)
  const verificationUrl = `${secrets.clientUrl}/verify-email?token=${verificationToken}`;
  emailService.sendVerificationEmail({ to: email, name, verificationUrl }).catch(() => {});

  res.status(201).json({
    success: true,
    message: "Account created! Please check your email to verify your account.",
  });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification link.",
    });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified successfully. You can now sign in." });
});

exports.resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  // Always return success to prevent email enumeration
  if (!user || user.isEmailVerified || user.provider !== "local") {
    return res.json({ success: true, message: "If that email exists and is unverified, a new link has been sent." });
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = verificationToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const verificationUrl = `${secrets.clientUrl}/verify-email?token=${verificationToken}`;
  emailService.sendVerificationEmail({ to: email, name: user.name, verificationUrl }).catch(() => {});

  res.json({ success: true, message: "If that email exists and is unverified, a new link has been sent." });
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  // Check email verification (skip for non-local providers)
  if (user.provider === "local" && !user.isEmailVerified) {
    return res.status(403).json({
      message: "Please verify your email before signing in. Check your inbox for the verification link.",
      needsVerification: true,
    });
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({
      message: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
    });
  }

  // If lock has expired, reset
  if (user.lockUntil && user.lockUntil <= new Date()) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
      await user.save();
      return res.status(423).json({
        message: `Account locked after ${MAX_LOGIN_ATTEMPTS} failed attempts. Try again in ${LOCK_DURATION_MINUTES} minutes.`,
      });
    }

    await user.save();
    const remaining = MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts;
    return res.status(400).json({
      message: `Wrong password. ${remaining} attempt(s) remaining before lockout.`,
    });
  }

  // Successful login — reset counters
  if (user.failedLoginAttempts > 0 || user.lockUntil) {
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();
  }

  const token = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  setAuthCookies(res, refreshToken);

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  user.name = name || user.name;
  user.email = email || user.email;

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ success: true, message: "Password updated successfully" });
});

exports.updateDetails = asyncHandler(async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) return res.status(404).json({ message: "User not found" });

  // Update profile
  user.name = name || user.name;
  user.email = email || user.email;

  // Handle password change if requested
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required to change password" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    }
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  // Read refresh token from httpOnly cookie (fallback to body for backward compat)
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  const stored = await RefreshToken.findOne({ token: refreshToken });

  if (!stored) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  if (stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: stored._id });
    return res.status(401).json({ message: "Refresh token expired" });
  }

  const user = await User.findById(stored.user);
  if (!user) {
    await RefreshToken.deleteOne({ _id: stored._id });
    return res.status(401).json({ message: "User not found" });
  }

  // Rotate: delete old, issue new pair
  await RefreshToken.deleteOne({ _id: stored._id });

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user._id);

  setAuthCookies(res, newRefreshToken);

  res.json({
    token: newAccessToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  clearAuthCookies(res);

  res.json({ success: true, message: "Logged out successfully" });
});

exports.googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const secrets = require("../config/secrets");

  if (!user) {
    return res.redirect(`${secrets.clientUrl}/?error=google_auth_failed`);
  }

  if (user.isBlocked) {
    return res.redirect(`${secrets.clientUrl}/?error=account_blocked`);
  }

  const token = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user._id);

  setAuthCookies(res, refreshToken);

  // Pass only the access token via URL (refresh token is in httpOnly cookie)
  res.redirect(`${secrets.clientUrl}/?oauth_token=${encodeURIComponent(token)}`);
});

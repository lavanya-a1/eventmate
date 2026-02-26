const asyncHandler = require('../../utils/asyncHandler');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');

// ─── GET /api/admin/settings/profile ──────────────────────────────────────────
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password').lean();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// ─── PUT /api/admin/settings/profile ──────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, bio } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (bio !== undefined) updates.bio = bio;

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.json({ success: true, data: user, message: 'Profile updated' });
});

// ─── PUT /api/admin/settings/password ─────────────────────────────────────────
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  const user = await User.findById(req.user.id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json({ success: true, message: 'Password changed successfully' });
});

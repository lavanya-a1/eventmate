const asyncHandler = require('../../utils/asyncHandler');
const User = require('../../models/User');
const Booking = require('../../models/Booking');
const bcrypt = require('bcryptjs');

// ─── GET /api/admin/users ──────────────────────────────────────────────────────
exports.getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { search, role, isBlocked } = req.query;

  const filter = { isDeleted: { $ne: true } };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) filter.role = role;
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: users, total, page, pages: Math.ceil(total / limit) });
});

// ─── GET /api/admin/users/:id ──────────────────────────────────────────────────
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// ─── GET /api/admin/users/:id/bookings ────────────────────────────────────────
exports.getUserBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.params.id })
    .populate('event', 'title date location image')
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: bookings });
});

// ─── PATCH /api/admin/users/:id/role ──────────────────────────────────────────
exports.updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowed = ['user', 'admin', 'organizer'];
  if (!allowed.includes(role)) {
    return res.status(400).json({ success: false, message: `Role must be one of: ${allowed.join(', ')}` });
  }
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot change your own role' });
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user, message: `Role updated to ${role}` });
});

// ─── PATCH /api/admin/users/:id/block ─────────────────────────────────────────
exports.toggleBlock = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot block your own account' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    data: { isBlocked: user.isBlocked },
    message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
  });
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted permanently' });
});

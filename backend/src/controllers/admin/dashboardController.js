const asyncHandler = require('../../utils/asyncHandler');
const User = require('../../models/User');
const Event = require('../../models/Event');
const Booking = require('../../models/Booking');
const Payment = require('../../models/Payment');
const Feedback = require('../../models/Feedback');

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
exports.getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalEvents,
    activeEvents,
    totalBookings,
    revenueAgg,
    lastMonthRevAgg,
    newUsersThisMonth,
    monthlyBookings,
    categoryBreakdown,
    revenueTrend,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: { $ne: true } }),
    Event.countDocuments({ isDeleted: { $ne: true } }),
    Event.countDocuments({ status: 'active', isDeleted: { $ne: true } }),
    Booking.countDocuments({ status: { $ne: 'cancelled' } }),

    // Total revenue (all time)
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // Last month revenue
    Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),

    // New users this month
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),

    // Monthly bookings chart — last 12 months
    Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    // Category breakdown
    Event.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),

    // Revenue trend — last 12 months
    Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;
  const lastMonthRevenue = lastMonthRevAgg[0]?.total || 0;

  // Merge monthlyBookings + revenueTrend into a combined array
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const bEntry = monthlyBookings.find((b) => b._id.year === year && b._id.month === month);
    const rEntry = revenueTrend.find((r) => r._id.year === year && r._id.month === month);
    chartData.push({
      month: MONTHS[month - 1],
      bookings: bEntry?.bookings || 0,
      revenue: rEntry?.revenue || 0,
    });
  }

  res.json({
    success: true,
    data: {
      kpis: {
        totalUsers,
        totalEvents,
        activeEvents,
        totalBookings,
        totalRevenue,
        newUsersThisMonth,
        revenueGrowth: lastMonthRevenue
          ? (((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
          : null,
      },
      chartData,
      categoryBreakdown: categoryBreakdown.map((c) => ({ name: c._id || 'Uncategorized', value: c.count })),
    },
  });
});

// ─── GET /api/admin/dashboard/activity ────────────────────────────────────────
exports.getActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  const [recentBookings, recentUsers, recentFeedback] = await Promise.all([
    Booking.find({ status: { $ne: 'cancelled' } })
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    User.find().sort({ createdAt: -1 }).limit(limit).select('name email createdAt role').lean(),
    Feedback.find().populate('user', 'name').populate('event', 'title').sort({ createdAt: -1 }).limit(limit).lean(),
  ]);

  const activity = [
    ...recentBookings.map((b) => ({
      type: 'booking',
      message: `${b.user?.name || 'User'} booked "${b.event?.title || 'event'}"`,
      time: b.createdAt,
    })),
    ...recentUsers.map((u) => ({
      type: 'user',
      message: `New user registered: ${u.name} (${u.email})`,
      time: u.createdAt,
    })),
    ...recentFeedback.map((f) => ({
      type: 'feedback',
      message: `${f.user?.name || 'User'} left a ${f.rating}-star review on "${f.event?.title || 'event'}"`,
      time: f.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, limit);

  res.json({ success: true, data: activity });
});

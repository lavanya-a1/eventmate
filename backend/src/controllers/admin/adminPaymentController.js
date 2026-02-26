const asyncHandler = require('../../utils/asyncHandler');
const Payment = require('../../models/Payment');

// ─── GET /api/admin/payments ───────────────────────────────────────────────────
exports.getPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { status, method, userId, eventId, dateFrom, dateTo } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (method) filter.paymentMethod = method;
  if (userId) filter.user = userId;
  if (eventId) filter.event = eventId;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter)
      .populate('user', 'name email')
      .populate('event', 'title date')
      .populate('booking', 'seats status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  res.json({ success: true, data: payments, total, page, pages: Math.ceil(total / limit) });
});

// ─── GET /api/admin/payments/summary ──────────────────────────────────────────
exports.getPaymentSummary = asyncHandler(async (req, res) => {
  const [totalRevAgg, methodBreakdown, statusBreakdown] = await Promise.all([
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalRevenue: totalRevAgg[0]?.total || 0,
      totalTransactions: totalRevAgg[0]?.count || 0,
      methodBreakdown: methodBreakdown.map((m) => ({ method: m._id, total: m.total, count: m.count })),
      statusBreakdown: statusBreakdown.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    },
  });
});

// ─── GET /api/admin/payments/analytics ────────────────────────────────────────
exports.getRevenueAnalytics = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months + 1);
  cutoff.setDate(1);
  cutoff.setHours(0, 0, 0, 0);

  const trend = await Payment.aggregate([
    { $match: { status: 'success', createdAt: { $gte: cutoff } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$amount' },
        transactions: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const chart = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const entry = trend.find((t) => t._id.year === year && t._id.month === month);
    chart.push({ month: MONTHS[month - 1], revenue: entry?.revenue || 0, transactions: entry?.transactions || 0 });
  }

  res.json({ success: true, data: chart });
});

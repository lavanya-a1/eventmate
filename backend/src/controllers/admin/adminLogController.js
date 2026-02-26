const asyncHandler = require('../../utils/asyncHandler');
const Log = require('../../models/Log');

// ─── GET /api/admin/logs ───────────────────────────────────────────────────────
exports.getLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const { level, module, dateFrom, dateTo, search } = req.query;

  const filter = {};
  if (level) filter.level = level;
  if (module) filter.module = { $regex: module, $options: 'i' };
  if (search) filter.message = { $regex: search, $options: 'i' };
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const [logs, total] = await Promise.all([
    Log.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Log.countDocuments(filter),
  ]);

  // Level summary
  const levelSummary = await Log.aggregate([
    { $group: { _id: '$level', count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    data: logs,
    total,
    page,
    pages: Math.ceil(total / limit),
    levelSummary: levelSummary.reduce((acc, l) => ({ ...acc, [l._id]: l.count }), {}),
  });
});

// ─── DELETE /api/admin/logs ────────────────────────────────────────────────────
exports.clearLogs = asyncHandler(async (req, res) => {
  const { level, olderThanDays } = req.query;
  const filter = {};
  if (level) filter.level = level;
  if (olderThanDays) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(olderThanDays));
    filter.createdAt = { $lte: cutoff };
  }

  const { deletedCount } = await Log.deleteMany(filter);
  res.json({ success: true, message: `Deleted ${deletedCount} log entries` });
});

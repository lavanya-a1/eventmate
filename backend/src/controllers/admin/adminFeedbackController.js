const asyncHandler = require('../../utils/asyncHandler');
const Feedback = require('../../models/Feedback');

// ─── GET /api/admin/feedback ───────────────────────────────────────────────────
exports.getFeedback = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { status, eventId, rating } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (eventId) filter.event = eventId;
  if (rating) filter.rating = parseInt(rating);

  const [feedback, total] = await Promise.all([
    Feedback.find(filter)
      .populate('user', 'name email avatar')
      .populate('event', 'title date image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Feedback.countDocuments(filter),
  ]);

  res.json({ success: true, data: feedback, total, page, pages: Math.ceil(total / limit) });
});

// ─── GET /api/admin/feedback/analytics ────────────────────────────────────────
exports.getRatingAnalytics = asyncHandler(async (req, res) => {
  const [avgAgg, distributionAgg, topEventsAgg] = await Promise.all([
    Feedback.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } }]),
    Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Feedback.aggregate([
      { $group: { _id: '$event', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: { path: '$event', preserveNullAndEmpty: true } },
      { $project: { eventTitle: '$event.title', avgRating: 1, count: 1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      averageRating: avgAgg[0]?.avg ? parseFloat(avgAgg[0].avg.toFixed(1)) : 0,
      totalReviews: avgAgg[0]?.total || 0,
      distribution: [1, 2, 3, 4, 5].map((star) => {
        const entry = distributionAgg.find((d) => d._id === star);
        return { rating: star, count: entry?.count || 0 };
      }),
      topRatedEvents: topEventsAgg,
    },
  });
});

// ─── PATCH /api/admin/feedback/:id/moderate ───────────────────────────────────
exports.moderateFeedback = asyncHandler(async (req, res) => {
  const { action } = req.body; // 'approve' | 'reject'
  const statusMap = { approve: 'approved', reject: 'rejected' };
  if (!statusMap[action]) {
    return res.status(400).json({ success: false, message: 'action must be "approve" or "reject"' });
  }

  const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status: statusMap[action] }, { new: true });
  if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });

  res.json({ success: true, data: feedback, message: `Feedback ${statusMap[action]}` });
});

// ─── DELETE /api/admin/feedback/:id ───────────────────────────────────────────
exports.deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
  res.json({ success: true, message: 'Feedback deleted' });
});

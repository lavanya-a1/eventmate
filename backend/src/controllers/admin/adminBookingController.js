const asyncHandler = require('../../utils/asyncHandler');
const Booking = require('../../models/Booking');
const Event = require('../../models/Event');

// ─── GET /api/admin/bookings ───────────────────────────────────────────────────
exports.getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { status, event, userId, dateFrom, dateTo } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (event) filter.event = event;
  if (userId) filter.user = userId;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('user', 'name email avatar')
      .populate('event', 'title date location image category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
  ]);

  // Status summary counts (ignores pagination)
  const summary = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const statusSummary = summary.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {});

  res.json({
    success: true,
    data: bookings,
    total,
    page,
    pages: Math.ceil(total / limit),
    summary: statusSummary,
  });
});

// ─── GET /api/admin/bookings/:id ──────────────────────────────────────────────
exports.getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone avatar')
    .populate('event', 'title date location image')
    .lean();
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  res.json({ success: true, data: booking });
});

// ─── PATCH /api/admin/bookings/:id/cancel ─────────────────────────────────────
exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
  if (booking.status === 'cancelled') {
    return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
  }

  booking.status = 'cancelled';
  await booking.save();

  // Restore seats
  await Event.findByIdAndUpdate(booking.event, {
    $inc: { bookedSeats: -(booking.seats || 1) },
  });

  res.json({ success: true, message: 'Booking cancelled and seats restored' });
});

// ─── GET /api/admin/bookings/export ───────────────────────────────────────────
exports.exportBookings = asyncHandler(async (req, res) => {
  const { status, dateFrom, dateTo } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'name email')
    .populate('event', 'title date location')
    .sort({ createdAt: -1 })
    .lean();

  const headers = ['Booking ID', 'User Name', 'User Email', 'Event', 'Event Date', 'Seats', 'Amount', 'Status', 'Created At'];

  const rows = bookings.map((b) => [
    b._id,
    b.user?.name || '',
    b.user?.email || '',
    b.event?.title || '',
    b.event?.date ? new Date(b.event.date).toLocaleDateString() : '',
    b.seats || 1,
    b.amount || 0,
    b.status,
    new Date(b.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows].map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="bookings-${Date.now()}.csv"`);
  res.send(csv);
});

const asyncHandler = require('../../utils/asyncHandler');
const Booking = require('../../models/Booking');
const Event = require('../../models/Event');

// ─── POST /api/admin/qr/validate ──────────────────────────────────────────────
exports.validateQR = asyncHandler(async (req, res) => {
  const { ticketId } = req.body;
  if (!ticketId) return res.status(400).json({ success: false, message: 'ticketId is required' });

  // ticketId can be the Booking _id or its qrCode field
  const booking = await Booking.findOne({ $or: [{ qrCode: ticketId }, { _id: ticketId.match(/^[a-f\d]{24}$/i) ? ticketId : null }] })
    .populate('user', 'name email avatar')
    .populate('event', 'title date location image');

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Ticket not found. Invalid QR code.' });
  }

  if (booking.status !== 'confirmed') {
    return res.status(400).json({ success: false, message: `Ticket status is "${booking.status}" — only confirmed tickets can be validated.`, data: { status: booking.status } });
  }

  if (booking.checkedIn) {
    return res.status(409).json({
      success: false,
      message: 'Ticket already used.',
      data: {
        checkedInAt: booking.checkedInAt,
        user: booking.user,
        event: booking.event,
      },
    });
  }

  // Mark as checked-in
  booking.checkedIn = true;
  booking.checkedInAt = new Date();
  await booking.save();

  res.json({
    success: true,
    message: 'Check-in successful!',
    data: {
      bookingId: booking._id,
      user: booking.user,
      event: booking.event,
      seats: booking.seats,
      checkedInAt: booking.checkedInAt,
    },
  });
});

// ─── GET /api/admin/qr/attendance/:eventId ────────────────────────────────────
exports.getAttendance = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.eventId).lean();
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  const [confirmed, checkedIn] = await Promise.all([
    Booking.countDocuments({ event: req.params.eventId, status: 'confirmed' }),
    Booking.countDocuments({ event: req.params.eventId, status: 'confirmed', checkedIn: true }),
  ]);

  const attendees = await Booking.find({ event: req.params.eventId, status: 'confirmed' })
    .populate('user', 'name email avatar')
    .select('user seats checkedIn checkedInAt createdAt')
    .sort({ checkedInAt: -1 })
    .lean();

  res.json({
    success: true,
    data: {
      event: { title: event.title, date: event.date, location: event.location, capacity: event.capacity },
      stats: { confirmed, checkedIn, notCheckedIn: confirmed - checkedIn, attendanceRate: confirmed ? Math.round((checkedIn / confirmed) * 100) : 0 },
      attendees,
    },
  });
});

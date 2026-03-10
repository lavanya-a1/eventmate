const asyncHandler = require("../utils/asyncHandler");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Feedback = require("../models/Feedback");

/**
 * @desc    Get organizer dashboard stats
 * @route   GET /api/organizer/dashboard
 * @access  Protected (Organizer)
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const organizerId = req.user.id;

  const events = await Event.find({ organizer: organizerId, isDeleted: { $ne: true } }).lean();
  const eventIds = events.map((e) => e._id);

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === "active").length;
  const now = new Date();
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now).length;
  const pastEvents = events.filter((e) => new Date(e.date) < now).length;
  const totalCapacity = events.reduce((s, e) => s + (e.capacity || 0), 0);
  const totalBooked = events.reduce((s, e) => s + (e.bookedSeats || 0), 0);

  const [bookings, payments, feedbacks] = await Promise.all([
    Booking.find({ event: { $in: eventIds } }).lean(),
    Payment.find({ event: { $in: eventIds }, status: "success" }).lean(),
    Feedback.find({ event: { $in: eventIds } }).lean(),
  ]);

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  // Recent bookings (last 10)
  const recentBookings = await Booking.find({ event: { $in: eventIds } })
    .populate("user", "name email")
    .populate("event", "title date")
    .sort("-createdAt")
    .limit(10)
    .lean();

  res.json({
    success: true,
    data: {
      totalEvents,
      activeEvents,
      upcomingEvents,
      pastEvents,
      totalCapacity,
      totalBooked,
      totalBookings,
      confirmedBookings,
      totalRevenue,
      avgRating,
      recentBookings,
    },
  });
});

/**
 * @desc    Get organizer's own events
 * @route   GET /api/organizer/events
 * @access  Protected (Organizer)
 */
exports.getMyEvents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const query = { organizer: req.user.id, isDeleted: { $ne: true } };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }
  if (status && status !== "all") {
    query.status = status;
  }

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .sort("-createdAt")
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: events,
  });
});

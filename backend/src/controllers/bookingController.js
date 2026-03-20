const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const { publishRealtimeEvent } = require("../services/realtimeService");

exports.createBooking = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId || req.body.eventId;
  const rawSeats = parseInt(req.body.seats, 10);
  const seats = Number.isFinite(rawSeats) && rawSeats > 0 ? rawSeats : 1;

  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ success: false, message: "Invalid eventId" });
  }

  const existing = await Booking.findOne({
    user: userId,
    event: eventId,
    status: { $in: ["confirmed", "pending", "waitlisted"] },
  }).lean();

  if (existing) {
    return res.status(409).json({ success: false, message: "You already have a booking for this event" });
  }

  const now = new Date();
  const event = await Event.findOne({ _id: eventId, isDeleted: false });
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }
  if (event.date < now) {
    return res.status(400).json({ success: false, message: "Cannot book past events" });
  }

  const createWaitlistBooking = async () => {
    const waitlistedBooking = await Booking.create({
      user: userId,
      event: eventId,
      status: "waitlisted",
      seats,
      amount: 0,
    });

    await Notification.create({
      user: userId,
      title: 'Added to Waitlist',
      message: `"${event.title}" is currently sold out. You were added to the waitlist.`,
      type: 'info'
    });

    publishRealtimeEvent({
      type: 'booking.waitlisted',
      payload: { bookingId: String(waitlistedBooking._id), eventId: String(eventId) },
      userIds: [String(userId)],
    });

    publishRealtimeEvent({
      type: 'booking.waitlisted',
      payload: { bookingId: String(waitlistedBooking._id), eventId: String(eventId) },
      roles: ["admin", "organizer"],
    });

    return res.status(201).json({
      success: true,
      message: "Event is sold out. You have been added to the waitlist.",
      data: {
        booking: waitlistedBooking,
        event,
      },
    });
  };

  if ((event.availableSeats ?? 0) < seats) {
    return createWaitlistBooking();
  }

  // Atomically reserve a seat (prevents overbooking under concurrency).
  const reservedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      isDeleted: false,
      date: { $gte: now },
      $expr: {
        $lte: [
          { $add: ["$bookedSeats", seats] },
          "$capacity",
        ],
      },
    },
    { $inc: { bookedSeats: seats } },
    { new: true }
  );

  if (!reservedEvent) {
    return createWaitlistBooking();
  }

  try {
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      status: "pending",
      seats,
      amount: typeof reservedEvent.price === "number" ? reservedEvent.price * seats : 0,
    });

    // Create notification
    await Notification.create({
      user: userId,
      title: 'Booking Initiated',
      message: `Your booking for ${reservedEvent.title} has been initiated. Please complete the payment.`,
      type: 'info'
    });

    publishRealtimeEvent({
      type: 'booking.created',
      payload: { bookingId: String(booking._id), eventId: String(eventId) },
      userIds: [String(userId)],
    });

    publishRealtimeEvent({
      type: 'booking.created',
      payload: { bookingId: String(booking._id), eventId: String(eventId) },
      roles: ["admin", "organizer"],
    });

    return res.status(201).json({
      success: true,
      data: {
        booking,
        event: reservedEvent,
      },
    });
  } catch (err) {
    // Compensate if booking creation failed after reserving seat.
    await Event.updateOne({ _id: eventId, bookedSeats: { $gte: seats } }, { $inc: { bookedSeats: -seats } });

    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: "You already booked this event" });
    }
    throw err;
  }
});

exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate("event")
    .sort({ createdAt: -1 });

  res.json({ success: true, results: bookings.length, data: bookings });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const bookingId = req.params.id;
  if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ success: false, message: "Invalid booking id" });
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    user: req.user.id,
    status: { $in: ["confirmed", "pending", "waitlisted"] },
  });

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const previousStatus = booking.status;
  booking.status = "cancelled";
  await booking.save();

  if (previousStatus !== "waitlisted") {
    await Event.updateOne(
      { _id: booking.event, bookedSeats: { $gt: 0 } },
      { $inc: { bookedSeats: -booking.seats } }
    );
  }

  publishRealtimeEvent({
    type: 'booking.cancelled',
    payload: { bookingId: String(booking._id), eventId: String(booking.event) },
    userIds: [String(req.user.id)],
  });

  publishRealtimeEvent({
    type: 'booking.cancelled',
    payload: { bookingId: String(booking._id), eventId: String(booking.event) },
    roles: ["admin", "organizer"],
  });

  res.json({ success: true, message: "Booking cancelled" });
});

/**
 * @desc    Get all bookings for a specific event (Organizer only)
 * @route   GET /api/bookings/event/:eventId
 * @access  Protected (Organizer or Admin)
 */
exports.getEventBookings = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const rawLimit = parseInt(req.query.limit, 10) || 20;
  const limit = Math.min(Math.max(rawLimit, 1), 100);
  const skip = (page - 1) * limit;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to view bookings for this event" });
  }

  const filter = { event: eventId, status: "confirmed" };

  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate("user", "name email")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    results: bookings.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    limit,
    data: bookings,
  });
});

/**
 * @desc    Export attendees for a specific event as CSV (Organizer only)
 * @route   GET /api/bookings/event/:eventId/export
 * @access  Protected (Organizer or Admin)
 */
exports.exportEventAttendees = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId).lean();
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to export attendees for this event" });
  }

  const attendees = await Booking.find({ event: eventId, status: "confirmed" })
    .populate("user", "name email")
    .sort("-createdAt")
    .lean();

  const headers = ["Booking ID", "Attendee Name", "Attendee Email", "Seats", "Amount", "Status", "Booked At"];
  const rows = attendees.map((b) => [
    b._id,
    b.user?.name || "",
    b.user?.email || "",
    b.seats || 1,
    b.amount || 0,
    b.status || "",
    b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const safeTitle = String(event.title || "event")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "event";

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="attendees-${safeTitle}-${Date.now()}.csv"`);
  res.send(csv);
});


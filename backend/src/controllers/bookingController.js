const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

exports.createBooking = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.eventId || req.body.eventId;

  if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ success: false, message: "Invalid eventId" });
  }

  const existing = await Booking.findOne({
    user: userId,
    event: eventId,
    status: "confirmed",
  }).lean();

  if (existing) {
    return res.status(409).json({ success: false, message: "You already booked this event" });
  }

  const now = new Date();

  // Atomically reserve a seat (prevents overbooking under concurrency).
  const reservedEvent = await Event.findOneAndUpdate(
    {
      _id: eventId,
      isDeleted: false,
      date: { $gte: now },
      $expr: { $lt: ["$bookedSeats", "$capacity"] },
    },
    { $inc: { bookedSeats: 1 } },
    { new: true }
  );

  if (!reservedEvent) {
    const event = await Event.findOne({ _id: eventId, isDeleted: false }).select("date capacity bookedSeats");
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    if (event.date < now) {
      return res.status(400).json({ success: false, message: "Cannot book past events" });
    }
    return res.status(400).json({ success: false, message: "Event is fully booked" });
  }

  try {
    const booking = await Booking.create({
      user: userId,
      event: eventId,
      status: "confirmed",
      seats: 1,
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
    await Event.updateOne({ _id: eventId, bookedSeats: { $gt: 0 } }, { $inc: { bookedSeats: -1 } });

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
    status: "confirmed",
  });

  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  booking.status = "cancelled";
  await booking.save();

  await Event.updateOne({ _id: booking.event, bookedSeats: { $gt: 0 } }, { $inc: { bookedSeats: -1 } });

  res.json({ success: true, message: "Booking cancelled" });
});

/**
 * @desc    Get all bookings for a specific event (Organizer only)
 * @route   GET /api/bookings/event/:eventId
 * @access  Protected (Organizer or Admin)
 */
exports.getEventBookings = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Check if user is the organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to view bookings for this event" });
  }

  const bookings = await Booking.find({ event: eventId, status: "confirmed" })
    .populate("user", "name email")
    .sort("-createdAt");

  res.json({
    success: true,
    results: bookings.length,
    data: bookings,
  });
});


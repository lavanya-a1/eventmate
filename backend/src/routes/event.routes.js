const express = require("express");
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const protect = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/events
// @desc    Create an event
// @access  Protected (Organizer or Admin)
router.post("/", auth, role(["organizer", "admin"]), async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      organizer: req.user.id
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /api/events
// @desc    Get all events with pagination, search, and filters
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      search,
      category,
      location,
      startDate,
      endDate,
      sortBy = "date",
      order = "asc",
    } = req.query;

    const query = {};

    // 🔎 Text Search
    if (search) {
      query.$text = { $search: search };
    }

    // 📂 Category
    if (category) {
      query.category = category;
    }

    // 📍 Location
    if (location) {
      query.location = location;
    }

    // 📅 Date Range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // 📊 Sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate("organizer", "name email")
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      events,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});


// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Protected (Owner or Admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check ownership or admin role
    if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this event" });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Protected (Owner or Admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check ownership or admin role
    if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this event" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;


router.post("/:eventId/book", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    // ❌ Prevent booking past events
    if (event.date < new Date()) {
      res.status(400);
      throw new Error("Cannot book past events");
    }

    // ❌ Prevent duplicate booking
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      event: event._id,
    });

    if (existingBooking) {
      res.status(400);
      throw new Error("You already booked this event");
    }

    // ❌ Prevent overbooking
    if (event.bookedSeats >= event.capacity) {
      res.status(400);
      throw new Error("Event is fully booked");
    }

    // ✅ Create booking
    await Booking.create({
      user: req.user.id,
      event: event._id,
    });

    // ✅ Increase booked seats
    event.bookedSeats += 1;
    await event.save();

    res.status(201).json({
      message: "Event booked successfully",
    });

  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const { body } = require("express-validator");
const validate = require("../middleware/validate");

router.post(
  "/",
  protect,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("date").isISO8601().withMessage("Valid date required"),
    body("capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
  ],
  validate,
  async (req, res) => {
    // your existing create event logic
  }
);


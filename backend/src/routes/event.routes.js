const express = require("express");
const Event = require("../models/Event");
const auth = require("../middleware/auth");

const router = express.Router();

// Create Event (Protected)
router.post("/", auth, async (req, res) => {
  try {
    const event = await Event.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

// Get all events
// GET EVENTS WITH PAGINATION + SEARCH + FILTERS
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const location = req.query.location || "";
    const upcoming = req.query.upcoming;

    const query = {};

    // 🔎 Search
    if (search) {
      query.$text = { $search: search };
    }

    // 📂 Category filter
    if (category) {
      query.category = category;
    }

    // 📍 Location filter
    if (location) {
      query.location = location;
    }

    // 📅 Upcoming events filter
    if (upcoming === "true") {
      query.date = { $gte: new Date() };
    }

    const total = await Event.countDocuments(query);

    const events = await Event.find(query)
      .populate("organizer", "name email")
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      events,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;


router.put("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(event, req.body);
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await event.deleteOne();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const role = require("../middleware/role");

router.post(
  "/",
  auth,
  role(["organizer", "admin"]),
  async (req, res) => {
    try {
      const event = await Event.create({
        ...req.body,
        createdBy: req.user.id
      });
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);


router.delete(
  "/:id",
  auth,
  role(["admin"]),
  async (req, res) => {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted by admin" });
  }
);

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const protect = require("../middleware/auth");
const role = require("../middleware/role");
const isAdmin = role(["admin"]);

// GET DASHBOARD STATS

router.get("/dashboard", protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() },
    });

    res.json({
      totalUsers,
      totalEvents,
      totalBookings,
      upcomingEvents,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//Events per Category (Aggregation)

router.get("/events-by-category", protect, isAdmin, async (req, res) => {
  try {
    const data = await Event.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//Events Per Month
router.get("/events-per-month", protect, isAdmin, async (req, res) => {
  try {
    const data = await Event.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

//Top 5 Popular Events
router.get("/top-events", protect, isAdmin, async (req, res) => {
  try {
    const data = await Booking.aggregate([
      {
        $group: {
          _id: "$event",
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});


module.exports = router;



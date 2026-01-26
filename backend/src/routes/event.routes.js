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

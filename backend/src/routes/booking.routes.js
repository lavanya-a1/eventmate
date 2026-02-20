const express = require("express");
const auth = require("../middleware/auth");
const bookingController = require("../controllers/bookingController");

const router = express.Router();

// All booking routes are authenticated
router.use(auth);

// Create booking (body: { eventId })
router.post("/", bookingController.createBooking);

// List current user's bookings
router.get("/me", bookingController.getMyBookings);

// Cancel booking
router.delete("/:id", bookingController.cancelBooking);

// Get bookings for an event (Organizer only)
router.get("/event/:eventId", bookingController.getEventBookings);

module.exports = router;


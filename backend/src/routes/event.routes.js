const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const validate = require("../middleware/validate");
const { createEventSchema, updateEventSchema, listEventsQuery } = require("../validations/event.validation");
const eventController = require("../controllers/eventController");
const bookingController = require("../controllers/bookingController");
const { upload } = require("../config/cloudinary");

const router = express.Router();

/**
 * @route   POST /api/events
 * @desc    Create an event
 * @access  Protected (Organizer or Admin)
 */
router.post("/", auth, role(["organizer", "admin"]), upload.single('image'), validate(createEventSchema), eventController.createEvent);

/**
 * @route   GET /api/events
 * @desc    Get all events with pagination, search, and filters
 * @access  Public
 */
router.get("/", validate(listEventsQuery, 'query'), eventController.getAllEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get single event by ID
 * @access  Public
 */
router.get("/:id", eventController.getEventById);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Protected (Owner or Admin)
 */
router.put("/:id", auth, validate(updateEventSchema), eventController.updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Protected (Owner or Admin)
 */
router.delete("/:id", auth, eventController.deleteEvent);

/**
 * @route   POST /api/events/:eventId/book
 * @desc    Book an event (1 seat)
 * @access  Protected
 */
router.post("/:eventId/book", auth, bookingController.createBooking);

module.exports = router;

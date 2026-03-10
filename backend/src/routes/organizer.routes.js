const express = require("express");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const organizerController = require("../controllers/organizerController");

const router = express.Router();

// All organizer routes require authentication + organizer role
router.use(auth, role(["organizer", "admin"]));

// Dashboard
router.get("/dashboard", organizerController.getDashboard);

// Organizer's own events (list)
router.get("/events", organizerController.getMyEvents);

module.exports = router;

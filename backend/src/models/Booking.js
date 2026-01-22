const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: String,
  eventId: String,
  status: String
});

module.exports = mongoose.model("Booking", BookingSchema);

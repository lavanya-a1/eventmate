const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },
  status: {
    type: String,
    enum: ["CONFIRMED", "WAITLISTED"],
    default: "CONFIRMED"
  }
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);

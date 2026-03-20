const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "waitlisted", "cancelled"],
    default: "pending",
    index: true,
  },
  seats: {
    type: Number,
    min: 1,
    default: 1,
  },
  amount: {
    type: Number,
    default: 0,
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  checkedIn: {
    type: Boolean,
    default: false,
  },
  checkedInAt: Date,
}, { timestamps: true });

// Only one *active* booking per user/event.
BookingSchema.index(
  { user: 1, event: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);

module.exports = mongoose.model("Booking", BookingSchema);

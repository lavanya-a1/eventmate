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
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
    index: true,
  },
  seats: {
    type: Number,
    min: 1,
    default: 1,
  },
}, { timestamps: true });

// Only one *active* booking per user/event.
BookingSchema.index(
  { user: 1, event: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);

module.exports = mongoose.model("Booking", BookingSchema);

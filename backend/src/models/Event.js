const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    location: String,
    date: { type: Date, required: true },
    category: String,
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: 0,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
  type: Boolean,
  default: false,
},

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.virtual("availableSeats").get(function () {
  const booked = typeof this.bookedSeats === "number" ? this.bookedSeats : 0;
  const cap = typeof this.capacity === "number" ? this.capacity : 0;
  return Math.max(0, cap - booked);
});

// Add text index for search
eventSchema.index({
  title: "text",
  description: "text",
  location: "text",
});

module.exports = mongoose.model("Event", eventSchema);

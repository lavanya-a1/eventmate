const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    location: String,
    date: { type: Date, required: true },
    category: String,
    capacity: Number,
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Add text index for search
eventSchema.index({ title: "text", description: "text", location: "text" });

module.exports = mongoose.model("Event", eventSchema);

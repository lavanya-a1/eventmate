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
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: {
  type: Boolean,
  default: false,
},

  },
  { timestamps: true }
);

// Add text index for search
eventSchema.index({
  title: "text",
  description: "text",
  location: "text",
});

module.exports = mongoose.model("Event", eventSchema);

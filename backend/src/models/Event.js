const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  title: String,
  date: Date,
  totalSeats: Number,
  availableSeats: Number
});

module.exports = mongoose.model("Event", EventSchema);

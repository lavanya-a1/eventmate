const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "organizer", "attendee", "user"],
    default: "user"
  },
  isBlocked: {
    type: Boolean,
    default: false,
    index: true,
  },
  phone: String,
  bio: String,
  avatar: String,
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    default: 'info',
    index: true,
  },
  module: {
    type: String,
    default: 'System',
    index: true,
  },
  message: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  ip: String,
  userAgent: String,
}, { timestamps: true });

// auto-expire old logs after 90 days
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('Log', logSchema);

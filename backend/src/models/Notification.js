const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error', 'broadcast', 'reminder', 'transactional'],
        default: 'info'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isBroadcast: {
        type: Boolean,
        default: false,
    },
    audience: {
        type: String,
        enum: ['all', 'attendees', 'organizers', 'specific'],
        default: 'specific',
    },
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['pending', 'sent', 'scheduled'],
        default: 'sent',
        index: true,
    },
    scheduledAt: Date,
    sentAt: Date,
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

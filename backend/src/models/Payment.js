const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Card', 'UPI', 'Wallet', 'Net Banking', 'Simulation'],
        default: 'Simulation'
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    refundedAt: Date,
    notes: String,
}, { timestamps: true });

paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

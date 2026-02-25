const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

exports.simulatePayment = async (req, res) => {
    try {
        const { bookingId, amount } = req.body;

        // Check if booking exists
        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Simulate success/failure (90% success rate)
        const isSuccess = Math.random() < 0.9;

        const payment = await Payment.create({
            booking: bookingId,
            user: req.user.id,
            amount,
            status: isSuccess ? 'success' : 'failed',
            transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            paymentMethod: 'Credit Card (Simulated)'
        });

        if (isSuccess) {
            booking.status = 'confirmed';
            await booking.save();

            // Create success notification
            await Notification.create({
                user: req.user.id,
                title: 'Payment Successful',
                message: `Your booking for the event has been confirmed. Transaction ID: ${payment.transactionId}`,
                type: 'success'
            });
        } else {
            booking.status = 'cancelled';
            await booking.save();

            // Compensate: release the seat
            await Event.updateOne(
                { _id: booking.event, bookedSeats: { $gt: 0 } },
                { $inc: { bookedSeats: -1 } }
            );

            // Create failure notification
            await Notification.create({
                user: req.user.id,
                title: 'Payment Failed',
                message: `Your payment was unsuccessful. The booking has been cancelled.`,
                type: 'error'
            });
        }

        res.status(isSuccess ? 200 : 400).json({
            success: isSuccess,
            message: isSuccess ? 'Payment successful' : 'Payment failed',
            data: payment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

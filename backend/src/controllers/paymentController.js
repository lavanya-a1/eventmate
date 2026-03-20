const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { publishRealtimeEvent } = require('../services/realtimeService');

exports.simulatePayment = async (req, res) => {
  try {
    const { bookingId, method } = req.body;

    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized for this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking is already cancelled' });
    }

    if (booking.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'This booking is already paid and confirmed' });
    }

    if (booking.status === 'waitlisted') {
      return res.status(400).json({ success: false, message: 'This booking is waitlisted and not ready for payment' });
    }

    const event = booking.event;
    const amount =
      typeof booking.amount === 'number' && booking.amount > 0
        ? booking.amount
        : typeof event?.price === 'number'
          ? event.price * (booking.seats || 1)
          : 0;

    const normalizedMethod = (() => {
      switch ((method || '').toLowerCase()) {
        case 'card':
        case 'credit card':
          return 'Card';
        case 'upi':
          return 'UPI';
        case 'wallet':
          return 'Wallet';
        case 'netbanking':
        case 'net banking':
          return 'Net Banking';
        default:
          return 'Simulation';
      }
    })();

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() < 0.9;

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user.id,
      event: booking.event,
      amount,
      status: isSuccess ? 'success' : 'failed',
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentMethod: normalizedMethod,
    });

    if (isSuccess) {
      booking.status = 'confirmed';
      await booking.save();

      await Notification.create({
        user: req.user.id,
        title: 'Payment Successful',
        message: `Your booking for "${event?.title || 'event'}" has been confirmed. Transaction ID: ${payment.transactionId}`,
        type: 'transactional',
      });

      publishRealtimeEvent({
        type: 'payment.success',
        payload: { bookingId: String(booking._id), eventId: String(booking.event) },
        userIds: [String(req.user.id)],
      });
      publishRealtimeEvent({
        type: 'payment.success',
        payload: { bookingId: String(booking._id), eventId: String(booking.event) },
        roles: ['admin', 'organizer'],
      });
    } else {
      booking.status = 'cancelled';
      await booking.save();

      await Event.updateOne(
        { _id: booking.event, bookedSeats: { $gt: 0 } },
        { $inc: { bookedSeats: -(booking.seats || 1) } }
      );

      await Notification.create({
        user: req.user.id,
        title: 'Payment Failed',
        message: 'Your payment was unsuccessful and the booking has been cancelled. Please try again.',
        type: 'error',
      });

      publishRealtimeEvent({
        type: 'payment.failed',
        payload: { bookingId: String(booking._id), eventId: String(booking.event) },
        userIds: [String(req.user.id)],
      });
      publishRealtimeEvent({
        type: 'payment.failed',
        payload: { bookingId: String(booking._id), eventId: String(booking.event) },
        roles: ['admin', 'organizer'],
      });
    }

    res.status(isSuccess ? 200 : 400).json({
      success: isSuccess,
      message: isSuccess ? 'Payment successful' : 'Payment failed',
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

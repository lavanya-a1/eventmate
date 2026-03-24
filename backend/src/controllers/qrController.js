const QRCode = require('qrcode');
const Booking = require('../models/Booking');

exports.generateQRCode = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId).populate('event user');

        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Ensure the user owns this booking
        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const qrData = JSON.stringify({
            bookingId: booking._id,
            event: booking.event.title,
            attendee: booking.user.name,
            seats: booking.seats,
            status: booking.status
        });

        const qrCodeUrl = await QRCode.toDataURL(qrData);

        res.status(200).json({
            success: true,
            data: qrCodeUrl
        });
    } catch (error) {
        const logger = require('../utils/logger');
        logger.error({ action: 'generateQR', error: error.message, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Failed to generate QR code.' });
    }
};

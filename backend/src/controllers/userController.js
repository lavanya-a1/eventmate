const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');

// Get Dashboard Summary
exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        const totalBookings = await Booking.countDocuments({ user: userId, status: 'confirmed' });

        // For completed events, we look for bookings where event date is in the past
        const bookings = await Booking.find({ user: userId, status: 'confirmed' }).populate('event');
        const now = new Date();

        const upcomingEvents = bookings.filter(b => b.event && new Date(b.event.date) > now).length;
        const completedEvents = bookings.filter(b => b.event && new Date(b.event.date) <= now).length;

        const notificationsCount = await Notification.countDocuments({ user: userId, isRead: false });

        res.status(200).json({
            success: true,
            summary: {
                upcomingEvents,
                totalBookings,
                completedEvents,
                notificationsCount
            }
        });
    } catch (error) {
        logger.error({ action: 'getDashboardSummary', error: error.message, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
    }
};

// Get Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        logger.error({ action: 'getProfile', error: error.message, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        logger.error({ action: 'updateProfile', error: error.message, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect current password' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        logger.error({ action: 'changePassword', error: error.message, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Failed to update password.' });
    }
};

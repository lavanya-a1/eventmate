const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        logger.error({ action: 'getNotifications', error: error.message, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) {
        logger.error({ action: 'markAsRead', error: error.message, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        const logger = require('../utils/logger');
        logger.error({ action: 'markAllAsRead', error: error.message, userId: req.user.id });
        res.status(500).json({ success: false, message: 'Failed to update notifications.' });
    }
};

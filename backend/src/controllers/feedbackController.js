const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
    try {
        const { event, rating, comment } = req.body;

        // Check if user already gave feedback for this event
        const existing = await Feedback.findOne({ user: req.user.id, event });
        if (existing) return res.status(400).json({ success: false, message: 'You have already provided feedback for this event' });

        const feedback = await Feedback.create({
            user: req.user.id,
            event,
            rating,
            comment
        });

        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ user: req.user.id }).populate('event', 'title');
        res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

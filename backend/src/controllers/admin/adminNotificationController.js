const asyncHandler = require('../../utils/asyncHandler');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const emailService = require('../../services/emailService');

// ─── GET /api/admin/notifications ─────────────────────────────────────────────
exports.getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { type, status } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  res.json({ success: true, data: notifications, total, page, pages: Math.ceil(total / limit) });
});

// ─── POST /api/admin/notifications/broadcast ──────────────────────────────────
exports.broadcastNotification = asyncHandler(async (req, res) => {
  const { title, message, audience = 'all', targetUsers = [], sendEmail: doSendEmail = false } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'title and message are required' });
  }

  // Determine recipients
  let recipientQuery = {};
  if (audience === 'attendees') recipientQuery.role = 'user';
  else if (audience === 'organizers') recipientQuery.role = 'organizer';
  else if (audience === 'specific') {
    if (!targetUsers.length) {
      return res.status(400).json({ success: false, message: 'targetUsers required for specific audience' });
    }
    recipientQuery._id = { $in: targetUsers };
  }

  const users = await User.find({ ...recipientQuery, isBlocked: { $ne: true } }).select('_id email name').lean();

  // Bulk-insert notifications
  const docs = users.map((u) => ({
    userId: u._id,
    title,
    message,
    type: 'broadcast',
    isBroadcast: true,
    audience,
    targetUsers: audience === 'specific' ? targetUsers : [],
    status: 'sent',
    sentAt: new Date(),
  }));

  await Notification.insertMany(docs, { ordered: false });

  // Optionally send emails
  if (doSendEmail) {
    const emailPromises = users.map((u) => emailService.sendBroadcast({ to: u.email, title, message }));
    await Promise.allSettled(emailPromises);
  }

  res.status(201).json({ success: true, message: `Broadcast sent to ${users.length} user(s)`, data: { count: users.length } });
});

// ─── POST /api/admin/notifications/reminder ───────────────────────────────────
exports.scheduleReminder = asyncHandler(async (req, res) => {
  const { title, message, eventId, scheduledAt, audience = 'attendees' } = req.body;

  if (!title || !message || !scheduledAt) {
    return res.status(400).json({ success: false, message: 'title, message, and scheduledAt are required' });
  }

  const notification = await Notification.create({
    title,
    message,
    type: 'reminder',
    isBroadcast: true,
    audience,
    status: 'scheduled',
    scheduledAt: new Date(scheduledAt),
    event: eventId || undefined,
  });

  res.status(201).json({ success: true, data: notification, message: 'Reminder scheduled' });
});

// ─── DELETE /api/admin/notifications/:id ──────────────────────────────────────
exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, message: 'Notification deleted' });
});

const cron = require('node-cron');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Run every 5 minutes: dispatch scheduled reminders that are due.
 */
const scheduleReminderJob = cron.schedule('*/5 * * * *', async () => {
  logger.info('[Cron] Checking for scheduled reminders...');
  try {
    const now = new Date();
    const dueReminders = await Notification.find({
      type: 'reminder',
      status: 'scheduled',
      scheduledAt: { $lte: now },
    }).lean();

    if (!dueReminders.length) return;
    logger.info(`[Cron] Found ${dueReminders.length} due reminder(s)`);

    for (const reminder of dueReminders) {
      try {
        let users = [];

        if (reminder.audience === 'specific' && reminder.targetUsers?.length) {
          users = await User.find({ _id: { $in: reminder.targetUsers }, isBlocked: { $ne: true } })
            .select('email name')
            .lean();
        } else if (reminder.event) {
          // Get users who booked this event
          const bookings = await Booking.find({ event: reminder.event, status: 'confirmed' })
            .populate('user', 'name email')
            .lean();
          users = bookings.map((b) => b.user).filter(Boolean);
        } else if (reminder.audience === 'organizers') {
          users = await User.find({ role: 'organizer', isBlocked: { $ne: true } }).select('email name').lean();
        } else {
          users = await User.find({ isBlocked: { $ne: true } }).select('email name').lean();
        }

        // Get event details if present
        let eventDetails = null;
        if (reminder.event) {
          eventDetails = await Event.findById(reminder.event).select('title date location').lean();
        }

        // Send emails
        for (const user of users) {
          if (eventDetails) {
            await emailService.sendReminder({
              to: user.email,
              name: user.name,
              eventTitle: eventDetails.title,
              eventDate: eventDetails.date,
              eventVenue: eventDetails.location,
            });
          } else {
            await emailService.sendBroadcast({ to: user.email, title: reminder.title, message: reminder.message });
          }
        }

        // Create individual Notification docs for each user
        if (users.length > 0) {
          const docs = users.map((u) => ({
            userId: u._id,
            title: reminder.title,
            message: reminder.message,
            type: 'reminder',
            status: 'sent',
            sentAt: new Date(),
            event: reminder.event || undefined,
          }));
          await Notification.insertMany(docs, { ordered: false });
        }

        // Mark source as sent
        await Notification.findByIdAndUpdate(reminder._id, { status: 'sent', sentAt: new Date() });

        logger.info(`[Cron] Reminder "${reminder.title}" sent to ${users.length} user(s)`);
      } catch (innerErr) {
        logger.error(`[Cron] Error processing reminder ${reminder._id}: ${innerErr.message}`);
      }
    }
  } catch (err) {
    logger.error(`[Cron] scheduleReminderJob error: ${err.message}`);
  }
});

/**
 * Run daily at 9:00 AM: Send 24-hour event reminders.
 */
const upcomingEventReminderJob = cron.schedule('0 9 * * *', async () => {
  logger.info('[Cron] Running upcoming event reminder job...');
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const upcomingEvents = await Event.find({ date: { $gte: tomorrow, $lt: dayAfter }, status: 'active' }).lean();

    for (const event of upcomingEvents) {
      const bookings = await Booking.find({ event: event._id, status: 'confirmed' })
        .populate('user', 'name email')
        .lean();

      for (const booking of bookings) {
        if (!booking.user?.email) continue;
        await emailService.sendReminder({
          to: booking.user.email,
          name: booking.user.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventVenue: event.location,
        });
      }

      logger.info(`[Cron] Event reminder for "${event.title}" sent to ${bookings.length} attendees`);
    }
  } catch (err) {
    logger.error(`[Cron] upcomingEventReminderJob error: ${err.message}`);
  }
});

module.exports = { scheduleReminderJob, upcomingEventReminderJob };

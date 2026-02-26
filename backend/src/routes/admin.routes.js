const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { protect } = require('../middleware/auth');
const { isAdmin, logActivity } = require('../middleware/admin');
const { validate } = require('../validations/adminValidation');
const schemas = require('../validations/adminValidation');

// Controllers
const dashboardCtrl = require('../controllers/admin/dashboardController');
const eventCtrl = require('../controllers/admin/adminEventController');
const userCtrl = require('../controllers/admin/adminUserController');
const bookingCtrl = require('../controllers/admin/adminBookingController');
const paymentCtrl = require('../controllers/admin/adminPaymentController');
const qrCtrl = require('../controllers/admin/adminQRController');
const notifCtrl = require('../controllers/admin/adminNotificationController');
const feedbackCtrl = require('../controllers/admin/adminFeedbackController');
const logsCtrl = require('../controllers/admin/adminLogController');
const settingsCtrl = require('../controllers/admin/adminSettingsController');


const router = express.Router();

// ─── Multer (image uploads) ───────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../uploads/tmp');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'), false);
    cb(null, true);
  },
});

// ─── Global admin middleware ──────────────────────────────────────────────────
router.use(protect);
router.use(isAdmin);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', dashboardCtrl.getDashboard);
router.get('/dashboard/activity', dashboardCtrl.getActivity);

// ─── Events ───────────────────────────────────────────────────────────────────
router.get('/events', validate(schemas.listEvents, 'query'), eventCtrl.getEvents);
router.get('/events/:id', eventCtrl.getEvent);
router.post('/events', logActivity('Events'), upload.single('image'), validate(schemas.createEvent), eventCtrl.createEvent);
router.put('/events/:id', logActivity('Events'), upload.single('image'), validate(schemas.updateEvent), eventCtrl.updateEvent);
router.patch('/events/:id/status', logActivity('Events'), eventCtrl.toggleStatus);
router.delete('/events/:id', logActivity('Events'), eventCtrl.deleteEvent);

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', validate(schemas.listUsers, 'query'), userCtrl.getUsers);
router.get('/users/:id', userCtrl.getUser);
router.get('/users/:id/bookings', userCtrl.getUserBookings);
router.patch('/users/:id/role', logActivity('Users'), validate(schemas.updateUserRole), userCtrl.updateRole);
router.patch('/users/:id/block', logActivity('Users'), userCtrl.toggleBlock);
router.delete('/users/:id', logActivity('Users'), userCtrl.deleteUser);

// ─── Bookings ─────────────────────────────────────────────────────────────────
router.get('/bookings', validate(schemas.listBookings, 'query'), bookingCtrl.getBookings);
router.get('/bookings/export', bookingCtrl.exportBookings);
router.get('/bookings/:id', bookingCtrl.getBooking);
router.patch('/bookings/:id/cancel', logActivity('Bookings'), bookingCtrl.cancelBooking);

// ─── Payments ─────────────────────────────────────────────────────────────────
router.get('/payments', validate(schemas.listPayments, 'query'), paymentCtrl.getPayments);
router.get('/payments/summary', paymentCtrl.getPaymentSummary);
router.get('/payments/analytics', paymentCtrl.getRevenueAnalytics);

// ─── QR / Attendance ──────────────────────────────────────────────────────────
router.post('/qr/validate', logActivity('QR'), validate(schemas.validateQR), qrCtrl.validateQR);
router.get('/qr/attendance/:eventId', qrCtrl.getAttendance);

// ─── Notifications ────────────────────────────────────────────────────────────
router.get('/notifications', notifCtrl.getNotifications);
router.post('/notifications/broadcast', logActivity('Notifications'), validate(schemas.broadcastNotification), notifCtrl.broadcastNotification);
router.post('/notifications/reminder', logActivity('Notifications'), validate(schemas.scheduleReminder), notifCtrl.scheduleReminder);
router.delete('/notifications/:id', logActivity('Notifications'), notifCtrl.deleteNotification);

// ─── Feedback ─────────────────────────────────────────────────────────────────
router.get('/feedback', feedbackCtrl.getFeedback);
router.get('/feedback/analytics', feedbackCtrl.getRatingAnalytics);
router.patch('/feedback/:id/moderate', logActivity('Feedback'), validate(schemas.moderateFeedback), feedbackCtrl.moderateFeedback);
router.delete('/feedback/:id', logActivity('Feedback'), feedbackCtrl.deleteFeedback);

// ─── System Logs ──────────────────────────────────────────────────────────────
router.get('/logs', logsCtrl.getLogs);
router.delete('/logs', logActivity('Logs'), logsCtrl.clearLogs);

// ─── Settings ─────────────────────────────────────────────────────────────────
router.get('/settings/profile', settingsCtrl.getProfile);
router.put('/settings/profile', validate(schemas.updateProfile), settingsCtrl.updateProfile);
router.put('/settings/password', validate(schemas.changePassword), settingsCtrl.changePassword);

module.exports = router;



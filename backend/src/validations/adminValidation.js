const Joi = require('joi');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const objectId = Joi.string()
  .pattern(/^[a-f\d]{24}$/i)
  .message('Must be a valid MongoDB ObjectId');

const paginationSchema = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
};

// ─── Events ───────────────────────────────────────────────────────────────────
exports.createEvent = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(5000).required(),
  location: Joi.string().trim().min(3).max(300).required(),
  date: Joi.date().iso().greater('now').required(),
  category: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  capacity: Joi.number().integer().min(1).required(),
  status: Joi.string().valid('active', 'inactive').default('active'),
  image: Joi.string().uri().optional(),
});

exports.updateEvent = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().trim().min(10).max(5000),
  location: Joi.string().trim().min(3).max(300),
  date: Joi.date().iso(),
  category: Joi.string().trim(),
  price: Joi.number().min(0),
  capacity: Joi.number().integer().min(1),
  status: Joi.string().valid('active', 'inactive'),
  image: Joi.string().uri().allow(''),
}).min(1);

exports.listEvents = Joi.object({
  ...paginationSchema,
  search: Joi.string().allow(''),
  status: Joi.string().valid('active', 'inactive'),
  category: Joi.string().allow(''),
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
});

// ─── Users ────────────────────────────────────────────────────────────────────
exports.listUsers = Joi.object({
  ...paginationSchema,
  search: Joi.string().allow(''),
  role: Joi.string().valid('user', 'admin', 'organizer'),
  isBlocked: Joi.boolean(),
});

exports.updateUserRole = Joi.object({
  role: Joi.string().valid('user', 'admin', 'organizer').required(),
});

// ─── Bookings ─────────────────────────────────────────────────────────────────
exports.listBookings = Joi.object({
  ...paginationSchema,
  status: Joi.string().valid('pending', 'confirmed', 'cancelled'),
  event: objectId,
  userId: objectId,
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
});

// ─── Payments ─────────────────────────────────────────────────────────────────
exports.listPayments = Joi.object({
  ...paginationSchema,
  status: Joi.string().valid('pending', 'success', 'failed'),
  method: Joi.string().valid('Card', 'UPI', 'Wallet', 'Net Banking', 'Simulation'),
  userId: objectId,
  eventId: objectId,
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
});

// ─── QR Validation ────────────────────────────────────────────────────────────
exports.validateQR = Joi.object({
  ticketId: Joi.string().required(),
});

// ─── Notifications ────────────────────────────────────────────────────────────
exports.broadcastNotification = Joi.object({
  title: Joi.string().trim().min(3).max(150).required(),
  message: Joi.string().trim().min(5).max(2000).required(),
  audience: Joi.string().valid('all', 'attendees', 'organizers', 'specific').default('all'),
  targetUsers: Joi.when('audience', {
    is: 'specific',
    then: Joi.array().items(objectId).min(1).required(),
    otherwise: Joi.array().items(objectId).default([]),
  }),
  sendEmail: Joi.boolean().default(false),
});

exports.scheduleReminder = Joi.object({
  title: Joi.string().trim().min(3).max(150).required(),
  message: Joi.string().trim().min(5).max(2000).required(),
  scheduledAt: Joi.date().iso().greater('now').required(),
  eventId: objectId.optional(),
  audience: Joi.string().valid('all', 'attendees', 'organizers').default('attendees'),
});

// ─── Feedback ─────────────────────────────────────────────────────────────────
exports.moderateFeedback = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
});

// ─── Settings ─────────────────────────────────────────────────────────────────
exports.updateProfile = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().trim().max(20).allow(''),
  bio: Joi.string().trim().max(500).allow(''),
}).min(1);

exports.changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

// ─── Validation middleware factory ───────────────────────────────────────────
/**
 * Usage: router.post('/events', protect, isAdmin, validate(schemas.createEvent), handler)
 */
exports.validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
  if (error) {
    const details = error.details.map((d) => d.message);
    return res.status(422).json({ success: false, message: 'Validation failed', errors: details });
  }
  req[property] = value;
  next();
};

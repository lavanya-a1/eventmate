const asyncHandler = require('../../utils/asyncHandler');
const Event = require('../../models/Event');
const cloudinary = require('../../config/cloudinary');
const logger = require('../../utils/logger');

// ─── GET /api/admin/events ─────────────────────────────────────────────────────
exports.getEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { search, status, category, dateFrom, dateTo } = req.query;

  const filter = { isDeleted: { $ne: true } };
  if (search) filter.$text = { $search: search };
  if (status) filter.status = status;
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = new Date(dateFrom);
    if (dateTo) filter.date.$lte = new Date(dateTo);
  }

  const [events, total] = await Promise.all([
    Event.find(filter)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Event.countDocuments(filter),
  ]);

  res.json({ success: true, data: events, total, page, pages: Math.ceil(total / limit) });
});

// ─── GET /api/admin/events/:id ────────────────────────────────────────────────
exports.getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate('organizer', 'name email').lean();
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event });
});

// ─── POST /api/admin/events ───────────────────────────────────────────────────
exports.createEvent = asyncHandler(async (req, res) => {
  const body = { ...req.body, organizer: req.user.id };

  // Handle image upload (multer puts file in req.file)
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'eventmate/events',
        transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
      });
      body.image = result.secure_url;
    } catch (err) {
      logger.warn(`[Event] Cloudinary upload failed: ${err.message}`);
    }
  }

  const event = await Event.create(body);
  res.status(201).json({ success: true, data: event, message: 'Event created' });
});

// ─── PUT /api/admin/events/:id ────────────────────────────────────────────────
exports.updateEvent = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'eventmate/events',
        transformation: [{ width: 1200, height: 630, crop: 'fill', quality: 'auto' }],
      });
      body.image = result.secure_url;
    } catch (err) {
      logger.warn(`[Event] Cloudinary upload failed: ${err.message}`);
    }
  }

  const event = await Event.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  res.json({ success: true, data: event, message: 'Event updated' });
});

// ─── PATCH /api/admin/events/:id/status ───────────────────────────────────────
exports.toggleStatus = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

  event.status = event.status === 'active' ? 'inactive' : 'active';
  await event.save();

  res.json({ success: true, data: { status: event.status }, message: `Event set to ${event.status}` });
});

// ─── DELETE /api/admin/events/:id ─────────────────────────────────────────────
exports.deleteEvent = asyncHandler(async (req, res) => {
  const hard = req.query.hard === 'true';

  if (hard) {
    await Event.findByIdAndDelete(req.params.id);
  } else {
    const event = await Event.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
  }

  res.json({ success: true, message: hard ? 'Event permanently deleted' : 'Event soft-deleted' });
});

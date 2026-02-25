const asyncHandler = require("../utils/asyncHandler");
const Event = require("../models/Event");

/**
 * @desc    Get all events with pagination, search, and filters
 * @route   GET /api/events
 * @access  Public
 */
exports.getAllEvents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 5,
    search,
    category,
    location,
    startDate,
    endDate,
    sortBy = "date",
    order = "asc",
  } = req.query;

  const query = { isDeleted: false };

  // 🔎 Flexible Search (Regex)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
  }

  // 📂 Category
  if (category) {
    query.category = category;
  }

  // 📍 Location
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  // 📅 Date Range
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // 📊 Sorting
  const sortOptions = {};
  sortOptions[sortBy] = order === "desc" ? -1 : 1;

  const total = await Event.countDocuments(query);

  const events = await Event.find(query)
    .populate("organizer", "name email")
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
    results: events.length,
    data: events,
  });
});

/**
 * @desc    Get single event by ID
 * @route   GET /api/events/:id
 * @access  Public
 */
exports.getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id, isDeleted: false })
    .populate("organizer", "name email");

  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  res.json({ success: true, data: event });
});

/**
 * @desc    Create an event
 * @route   POST /api/events
 * @access  Protected (Organizer or Admin)
 */
exports.createEvent = asyncHandler(async (req, res) => {
  const eventData = {
    ...req.body,
    organizer: req.user.id,
  };

  if (req.file) {
    eventData.image = req.file.path;
  }

  const event = await Event.create(eventData);

  res.status(201).json({
    success: true,
    data: event,
  });
});

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Protected (Owner or Admin)
 */
exports.updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);

  if (!event || event.isDeleted) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Check ownership or admin role
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to update this event" });
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: event });
});

/**
 * @desc    Delete an event (Soft Delete)
 * @route   DELETE /api/events/:id
 * @access  Protected (Owner or Admin)
 */
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event || event.isDeleted) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Check ownership or admin role
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to delete this event" });
  }

  event.isDeleted = true;
  await event.save();

  res.json({ success: true, message: "Event removed successfully" });
});

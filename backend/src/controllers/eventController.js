const asyncHandler = require("../utils/asyncHandler");
const Event = require("../models/Event");

exports.getAllEvents = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const keyword = req.query.keyword
    ? { title: { $regex: req.query.keyword, $options: "i" } }
    : {};

  const categoryFilter = req.query.category
    ? { category: req.query.category }
    : {};

  const sortBy = req.query.sort || "createdAt";

  const filter = { ...keyword, ...categoryFilter };

  const total = await Event.countDocuments(filter);

  const events = await Event.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    page,
    totalPages: Math.ceil(total / limit),
    totalResults: total,
    results: events.length,
    data: events,
  });
});

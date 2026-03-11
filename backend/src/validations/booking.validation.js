const Joi = require('joi');

const objectId = Joi.string()
  .pattern(/^[a-f\d]{24}$/i)
  .message('Must be a valid MongoDB ObjectId');

exports.createBooking = Joi.object({
  eventId: objectId.required()
    .messages({ 'any.required': 'Event ID is required' }),
  seats: Joi.number().integer().min(1).max(10).default(1),
});

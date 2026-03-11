const Joi = require('joi');

const objectId = Joi.string()
  .pattern(/^[a-f\d]{24}$/i)
  .message('Must be a valid MongoDB ObjectId');

exports.createFeedback = Joi.object({
  event: objectId.required()
    .messages({ 'any.required': 'Event ID is required' }),
  rating: Joi.number().integer().min(1).max(5).required()
    .messages({ 'any.required': 'Rating is required', 'number.min': 'Rating must be between 1 and 5' }),
  comment: Joi.string().trim().max(2000).allow(''),
});

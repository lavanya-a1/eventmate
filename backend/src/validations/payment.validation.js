const Joi = require('joi');

const objectId = Joi.string()
  .pattern(/^[a-f\d]{24}$/i)
  .message('Must be a valid MongoDB ObjectId');

exports.simulatePayment = Joi.object({
  bookingId: objectId.required()
    .messages({ 'any.required': 'Booking ID is required' }),
  method: Joi.string().valid('card', 'credit card', 'upi', 'wallet', 'netbanking', 'net banking', 'simulation')
    .insensitive()
    .default('simulation'),
});

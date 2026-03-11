const Joi = require('joi');

exports.updateProfile = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().trim().lowercase().email(),
}).min(1);

exports.changePassword = Joi.object({
  currentPassword: Joi.string().required()
    .messages({ 'any.required': 'Current password is required' }),
  newPassword: Joi.string().min(6).max(128).required()
    .messages({ 'string.min': 'New password must be at least 6 characters', 'any.required': 'New password is required' }),
});

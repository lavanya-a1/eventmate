const Joi = require('joi');

exports.register = Joi.object({
  name: Joi.string().trim().min(2).max(100).required()
    .messages({ 'any.required': 'Name is required' }),
  email: Joi.string().trim().lowercase().email().required()
    .messages({ 'string.email': 'Please provide a valid email', 'any.required': 'Email is required' }),
  password: Joi.string().min(6).max(128).required()
    .messages({ 'string.min': 'Password must be at least 6 characters', 'any.required': 'Password is required' }),
});

exports.login = Joi.object({
  email: Joi.string().trim().lowercase().email().required()
    .messages({ 'any.required': 'Email is required' }),
  password: Joi.string().required()
    .messages({ 'any.required': 'Password is required' }),
});

exports.resendVerification = Joi.object({
  email: Joi.string().trim().lowercase().email().required()
    .messages({ 'string.email': 'Please provide a valid email', 'any.required': 'Email is required' }),
});

exports.refreshToken = Joi.object({
  refreshToken: Joi.string().required()
    .messages({ 'any.required': 'Refresh token is required' }),
});

exports.updateProfile = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().trim().lowercase().email(),
}).min(1).messages({ 'object.min': 'At least one field is required' });

exports.updatePassword = Joi.object({
  currentPassword: Joi.string().required()
    .messages({ 'any.required': 'Current password is required' }),
  newPassword: Joi.string().min(6).max(128).required()
    .messages({ 'string.min': 'New password must be at least 6 characters', 'any.required': 'New password is required' }),
});

exports.updateDetails = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  email: Joi.string().trim().lowercase().email(),
  currentPassword: Joi.string(),
  newPassword: Joi.string().min(6).max(128),
}).with('newPassword', 'currentPassword')
  .messages({ 'object.with': 'Current password is required to change password' });

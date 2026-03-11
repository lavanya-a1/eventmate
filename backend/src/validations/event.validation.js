const Joi = require("joi");

const objectId = Joi.string()
  .pattern(/^[a-f\d]{24}$/i)
  .message('Must be a valid MongoDB ObjectId');

exports.createEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  description: Joi.string().trim().min(10).max(5000).required(),
  category: Joi.string().trim().required(),
  price: Joi.number().min(0).required(),
  date: Joi.date().iso().required(),
  location: Joi.string().trim().min(2).max(300).required(),
  capacity: Joi.number().integer().min(1).default(100),
  status: Joi.string().valid('active', 'inactive').default('active'),
});

exports.updateEventSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().trim().min(10).max(5000),
  category: Joi.string().trim(),
  price: Joi.number().min(0),
  date: Joi.date().iso(),
  location: Joi.string().trim().min(2).max(300),
  capacity: Joi.number().integer().min(1),
  status: Joi.string().valid('active', 'inactive'),
}).min(1);

exports.listEventsQuery = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(5),
  search: Joi.string().allow(''),
  category: Joi.string().allow(''),
  location: Joi.string().allow(''),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  sortBy: Joi.string().valid('date', 'price', 'title').default('date'),
  order: Joi.string().valid('asc', 'desc').default('asc'),
});

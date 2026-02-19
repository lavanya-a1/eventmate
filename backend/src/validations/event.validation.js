const Joi = require("joi");

exports.createEventSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().required(),
  price: Joi.number().min(0).required(),
  date: Joi.date().required(),
  location: Joi.string().required(),
});

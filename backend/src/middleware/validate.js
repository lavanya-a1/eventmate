/**
 * Joi validation middleware factory.
 *
 * @param {import('joi').Schema} schema  – Joi schema to validate against
 * @param {'body'|'query'|'params'} [property='body'] – req property to validate
 */
const validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({
      success: false,
      message: messages[0],
      errors: messages,
    });
  }

  req[property] = value;
  next();
};

module.exports = validate;

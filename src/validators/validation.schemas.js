const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().trim().email().min(6).required(),
  password: Joi.string().trim().min(6).required()
});

const registerSchema = Joi.object({
  displayName: Joi.string().trim().min(1).required(),
  fullName: Joi.string().trim().min(1).required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().trim().min(4).max(32).required()
});

module.exports = {
  loginSchema,
  registerSchema
}

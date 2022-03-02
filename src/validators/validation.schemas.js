const Joi = require('joi');

const signinSchema = Joi.object({
  email: Joi.string().trim().email().min(4).max(32).required(),
  password: Joi.string().trim().min(4).max(32).required()
});

const signupSchema = Joi.object({
  displayName: Joi.string().trim().min(4).max(32).required(),
  fullName: Joi.string().trim().min(4).max(32).required(),
  email: Joi.string().email().trim().min(4).max(32).required(),
  password: Joi.string().trim().min(4).max(32).required()
});

module.exports = {
  signinSchema,
  signupSchema
}

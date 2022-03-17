const Joi = require('joi');
const { base64Parse, origValue } = require('../consts/validate-const');

const signinSchema = Joi.object({
  email: Joi.string().trim().email().min(4).max(32).required(),
  password: Joi.string().trim().min(4).max(32).required()
});

const signupSchema = Joi.object({
  displayName: Joi.string().trim().min(4).max(32).allow(null, ''),
  fullName: Joi.string().trim().min(4).max(32).required(),
  email: Joi.string().email().trim().min(4).max(32).required(),
  password: Joi.string().trim().min(4).max(32).required(),
  avatarImage: Joi.string().custom(base64Parse).base64().custom(origValue).allow(null, '')
});

const tokenSchema = Joi.object({
  refreshToken: Joi.string().trim().required()
});

module.exports = {
  signinSchema,
  signupSchema,
  tokenSchema
}

const Joi = require('joi');

const base64Parse = (base64) => {
  const data = base64.split(',');
  return data[1];
};

const origValue = (value, helpers) => {
  return  helpers.original;
}

const signinSchema = Joi.object({
  email: Joi.string().trim().email().min(4).max(32).required(),
  password: Joi.string().trim().min(4).max(32).required()
});

const signupSchema = Joi.object({
  displayName: Joi.any(),
  fullName: Joi.string().trim().min(4).max(32).required(),
  email: Joi.string().email().trim().min(4).max(32).required(),
  password: Joi.string().trim().min(4).max(32).required(),
  avatarImage: Joi.any()
});

module.exports = {
  signinSchema,
  signupSchema
}

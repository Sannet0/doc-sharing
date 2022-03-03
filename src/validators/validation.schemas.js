const Joi = require('joi');

const base64Parse = (base64) => {
  const data = base64.split(/\s/g);
  return data[1];
};

const extractType = (value, helpers) => {
  const orig = helpers.original;
  const data = orig.split(/\s/g);
  const info = data[0].split(/[^a-zа-яё0-9]/gi);

  return {
    base64: value,
    type: info[2]
  }
}

const signinSchema = Joi.object({
  email: Joi.string().trim().email().min(4).max(32).required(),
  password: Joi.string().trim().min(4).max(32).required()
});

const signupSchema = Joi.object({
  displayName: Joi.string().trim().min(4).max(32),
  fullName: Joi.string().trim().min(4).max(32).required(),
  email: Joi.string().email().trim().min(4).max(32).required(),
  password: Joi.string().trim().min(4).max(32).required(),
  avatarImage: Joi.string().custom(base64Parse).base64().custom(extractType).empty()
});

module.exports = {
  signinSchema,
  signupSchema
}

const Joi = require('joi');
const { base64Parse, origValue } = require('../consts/validate-const');

const uploadFileSchema = Joi.object({
  folderId: Joi.number().required(),
  content: Joi.string().custom(base64Parse).base64().custom(origValue).required(),
  name: Joi.string().trim().required()
});

module.exports = {
  uploadFileSchema
};

const Joi = require('joi');

const getFolderInfoSchema = Joi.object({
  folderId: Joi.string().required()
});

const deleteFolderSchema = Joi.object({
  folderId: Joi.string().required()
});

const editFolderNameSchema = Joi.object({
  folderId: Joi.number().required(),
  newName: Joi.string().trim().min(4).max(32).required()
});

const createFolderSchema = Joi.object({
  folderName: Joi.string().trim().min(4).max(32).required(),
  originFolderId: Joi.number().required()
});

module.exports = {
  getFolderInfoSchema,
  deleteFolderSchema,
  editFolderNameSchema,
  createFolderSchema
};

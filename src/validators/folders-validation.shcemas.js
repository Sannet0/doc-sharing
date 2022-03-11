const Joi = require('joi');

const getFolderInfoSchema = {
  folderId: Joi.number().required()
};

const deleteFolderSchema = {
  folderId: Joi.number().required()
};

const editFolderNameSchema = {
  folderId: Joi.number().required(),
  newName: Joi.string().trim().min(4).max(32).required()
};

const createFolderSchema = {
  folderName: Joi.string().trim().min(4).max(32).required(),
  originFolderId: Joi.number().required()
};

module.exports = {
  getFolderInfoSchema,
  deleteFolderSchema,
  editFolderNameSchema,
  createFolderSchema
};

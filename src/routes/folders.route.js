const router = require('express').Router();
const foldersController = require('../controller/folders.controller');
const validator = require('../middelwares/validation.middleware');
const validatorSchemas = require('../validators/folders-validation.shcemas');

router.get('', validator(validatorSchemas.getFolderInfoSchema, true), foldersController.getFolderInfo);
router.post('', validator(validatorSchemas.createFolderSchema), foldersController.createFolder);
router.delete('', validator(validatorSchemas.deleteFolderSchema, true), foldersController.deleteFolder);
router.patch('', validator(validatorSchemas.editFolderNameSchema), foldersController.editFolderName);

module.exports = router;

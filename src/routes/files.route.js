const router = require('express').Router();
const filesController = require('../controller/files.controller');
const validator = require('../middelwares/validation.middleware');
const validatorSchemas = require('../validators/file-validator.shcemas');

router.post('', filesController.uploadFile);
//router.post('', validator(validatorSchemas.uploadFileSchema), filesController.uploadFile);

module.exports = router;

const router = require('express').Router();
const authController = require('../controller/auth.controller');
const validator = require('../middelwares/validation.middleware');
const validatorSchemas = require('../validators/validation.schemas');

router.get('/signin', validator(validatorSchemas.signinSchema, true), authController.signin);
router.post('/signup', validator(validatorSchemas.signupSchema), authController.signup);
router.patch('/token', authController.authWithRefToken);

module.exports = router;

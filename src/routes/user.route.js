const router = require('express').Router();
const userController = require('../controller/user.controller');
const validator = require('../middelwares/validation.middleware');
const { loginSchema, registerSchema } = require('../validators/validation.schemas');

router.get('/login', validator(loginSchema, true), userController.login);
router.post('/registration', validator(registerSchema), userController.registration);

module.exports = router;

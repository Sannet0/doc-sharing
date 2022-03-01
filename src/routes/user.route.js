const router = require('express').Router();
const userController = require('../controller/user.controller');
const validator = require('../middelwares/validation.middleware');
const { loginSchema, registerSchema } = require('../validators/validation.schemas');

/**
 * @swagger
 * /user/login:
 *   get:
 *     summary: user login
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: user email
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: user password
 *     responses:
 *       200:
 *         description: jwt token and user data
 */
router.get('/login', validator(loginSchema, true), userController.login);

/**
 * @swagger
 * /user/registration:
 *   post:
 *     summary: user registration
 *     tags: [User]
 *     parameters:
 *       - in: body
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: user email
 *       - in: body
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: user password
 *       - in: body
 *         name: fullname
 *         schema:
 *           type: string
 *         required: true
 *         description: user fullname
 *       - in: body
 *         name: displayname
 *         schema:
 *           type: string
 *         required: true
 *         description: user displayname
 *     responses:
 *       200:
 *         description: message
 */
router.post('/registration', validator(registerSchema), userController.registration);

module.exports = router;

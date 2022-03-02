const router = require('express').Router();
const authController = require('../controller/auth.controller');
const validator = require('../middelwares/validation.middleware');
const validatorSchemas = require('../validators/validation.schemas');

/**
 * @swagger
 * /auth/signin:
 *   get:
 *     summary: user login
 *     tags: [Auth]
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
router.get('/signin', validator(validatorSchemas.signinSchema, true), authController.signin);

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: user registration
 *     tags: [Auth]
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
router.post('/signup', validator(validatorSchemas.signupSchema), authController.signup);

module.exports = router;

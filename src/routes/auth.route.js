const router = require('express').Router();
const authController = require('../controller/auth.controller');
const validator = require('../middelwares/validation.middleware');
const { singinShema, singupShema } = require('../validators/validation.schemas');

/**
 * @swagger
 * /auth/singin:
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
router.get('/singin', validator(singinShema, true), authController.singin);

/**
 * @swagger
 * /auth/singup:
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
router.post('/singup', validator(singupShema), authController.singup);

module.exports = router;

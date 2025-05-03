const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkTokenUsage, checkApiKeyCount } = require('../middleware/auth'); // Import middleware for token verification

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Route to get user profile
router.get('/profile', verifyToken, userController.getProfile);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: [] 
 *       - csrfAuth: [] 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               plan:
 *                 type: string
 *                 enum: [basic, pro, pro_plus]
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Route to update user profile
router.put('/profile', verifyToken, (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, userController.updateProfile);

/**
 * @swagger
 * /user/api-key:
 *   post:
 *     summary: Generate a new API key for the authenticated user
 *     tags: [User]
 *     security:
 *       - bearerAuth: [] 
 *       - csrfAuth: [] 
 *     responses:
 *       200:
 *         description: API key generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 api_key:
 *                   type: string
 *       400:
 *         description: API key limit reached or invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// Route to generate a new API key
router.post('/api-key', verifyToken, (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, userController.generateApiKey);

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user and return a JWT
 *     tags: [User]
 *     security:
 *       - csrfAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Successful login, returns JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
// Route to log in a user
router.post('/login', (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, userController.login);

module.exports = router;

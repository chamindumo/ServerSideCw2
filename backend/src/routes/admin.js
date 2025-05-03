const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth'); // Import middleware for token verification and admin check

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] 
 *       - csrfAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
// Route to get all users (admin-only)
router.get('/users', verifyToken, verifyAdmin, adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] 
 *       - csrfAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
// Route to get a user by ID (admin-only)
router.get('/users/:id', verifyToken, verifyAdmin, adminController.getUserById);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Admin]
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
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *                 default: user
 *               plan:
 *                 type: string
 *                 enum: [basic, pro, pro_plus]
 *                 default: basic
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
// Route to create a new user (admin-only)
router.post('/users', (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next(); // Proceed to the controller
}, adminController.createUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] 
 *       - csrfAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *               plan:
 *                 type: string
 *                 enum: [basic, pro, pro_plus]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
// Route to update a user by ID (admin-only)
router.put('/users/:id', verifyToken, verifyAdmin, (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next(); // Proceed to the controller
}, adminController.updateUser);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] 
 *       - csrfAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
// Route to delete a user by ID (admin-only)
router.delete('/users/:id', verifyToken, verifyAdmin, (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next(); // Proceed to the controller
}, adminController.deleteUser);

/**
 * @swagger
 * /admin/api-keys:
 *   get:
 *     summary: Get all API keys
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: List of all API keys
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
// Route to get all API keys (admin-only)
router.get('/api-keys', verifyToken, verifyAdmin, adminController.getAllApiKeys);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login an admin and return a JWT
 *     tags: [Admin]
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
// Route to log in an admin
router.post('/login', adminController.loginAdmin);

module.exports = router;

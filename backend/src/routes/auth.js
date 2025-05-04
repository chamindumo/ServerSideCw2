const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth'); // Import middleware for token verification


/**
 * @swagger
 * /auth/csrf-token:
 *   get:
 *     summary: Get CSRF token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: CSRF token retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 */
router.get('/csrf-token', (req, res) => {
  const csrfToken = req.csrfToken(); // Generate a CSRF token
  res.cookie('XSRF-TOKEN', csrfToken); // Set CSRF token in a cookie
  res.json({ csrfToken }); // Return the CSRF token in JSON format
});

module.exports = router;
const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');
const { verifyApiKey, enforceApiUsageLimit, verifyToken } = require('../middleware/auth'); // Import middleware for token and API key verification

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get all countries' data
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of countries with filtered data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Country'
 *       401:
 *         description: Unauthorized - Invalid or missing JWT, CSRF token, or API key
 *       429:
 *         description: API usage limit reached
 *       500:
 *         description: Server error
 */
// Route to fetch all countries
router.get('/', verifyToken, (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, verifyApiKey, enforceApiUsageLimit, (req, res, next) => {
  req.tokensConsumed = 1; // Set tokens consumed for this request
  next();
}, countryController.getCountryData);

/**
 * @swagger
 * /countries/{countryName}:
 *   get:
 *     summary: Get data for a specific country
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: countryName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the country
 *     responses:
 *       200:
 *         description: Country data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Country'
 *       401:
 *         description: Unauthorized - Invalid or missing JWT, CSRF token, or API key
 *       429:
 *         description: API usage limit reached
 *       500:
 *         description: Server error
 */
// Route to fetch a specific country
router.get('/:countryName', verifyToken, (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, verifyApiKey, enforceApiUsageLimit, (req, res, next) => {
  req.tokensConsumed = 1; // Set tokens consumed for this request
  next();
}, countryController.getSingleCountry);

module.exports = router;
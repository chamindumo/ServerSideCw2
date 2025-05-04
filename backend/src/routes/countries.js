const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryController');

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get all countries' data
 *     tags: [Countries]
 *     security:
 *       - csrfAuth: []
 *     responses:
 *       200:
 *         description: List of countries with filtered data
 *       403:
 *         description: Invalid CSRF token
 *       500:
 *         description: Server error
 */
router.get('/', (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, countryController.getCountryData);

/**
 * @swagger
 * /countries/{countryName}:
 *   get:
 *     summary: Get data for a specific country
 *     tags: [Countries]
 *     security:
 *       - csrfAuth: []
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
 *       403:
 *         description: Invalid CSRF token
 *       500:
 *         description: Server error
 */
router.get('/:countryName', (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, countryController.getSingleCountry);

module.exports = router;
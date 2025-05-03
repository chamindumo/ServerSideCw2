const axios = require('axios');

/**
 * @swagger
 * components:
 *   schemas:
 *     Country:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         capital:
 *           type: string
 *         currencies:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *         languages:
 *           type: array
 *           items:
 *             type: string
 *         flag:
 *           type: string
 */
exports.getCountryData = async (req, res) => {
  try {
    // Fetch data from an external API (e.g., RestCountries.com)
    const response = await axios.get('https://restcountries.com/v3.1/all');
    const countries = response.data.map((country) => ({
      name: country.name.common, // Extract country name
      region: country.region, // Extract region
      population: country.population, // Extract population
    }));

    res.json(countries); // Return the list of countries
  } catch (error) {
    console.error('Error fetching country data:', error.message); // Log error
    res.status(500).json({ error: 'Failed to fetch country data' }); // Return error response
  }
};

exports.getSingleCountry = async (req, res) => {
  const { countryName } = req.params; // Extract country name from request parameters

  try {
    // Fetch data for a specific country from an external API
    const response = await axios.get(
      `https://restcountries.com/v3.1/name/${countryName}`
    );
    const country = response.data[0]; // Extract the first result

    if (!country) {
      return res.status(404).json({ error: 'Country not found' }); // Return error if country not found
    }

    // Filter and format the country data
    const filteredData = {
      name: country.name.common, // Extract country name
      capital: country.capital?.[0] || 'N/A', // Extract capital or set default
      currencies: country.currencies
        ? Object.values(country.currencies).map((c) => ({
            name: c.name, // Extract currency name
            symbol: c.symbol, // Extract currency symbol
          }))
        : [],
      languages: country.languages ? Object.values(country.languages) : [], // Extract languages
      flag: country.flags.png, // Extract flag URL
    };

    res.json(filteredData); // Return the filtered country data
  } catch (error) {
    console.error('Error fetching country data:', error.message); // Log error
    res.status(500).json({ error: 'Failed to fetch country data' }); // Return error response
  }
};
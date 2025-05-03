const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(401).json({ error: 'No token provided' }); // Return error if no token is provided
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' }); // Return error if the token is invalid
    }
    req.userId = decoded.id; // Attach the decoded user ID to the request object
    console.log('Decoded userId from JWT:', req.userId); // Debug log for user ID
    next(); // Proceed to the next middleware
  });
};

// Middleware to verify the API key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']; // Extract the API key from the request headers

  if (!apiKey) {
    console.error('No API key provided'); // Log error if no API key is provided
    return res.status(401).json({ error: 'No API key provided' }); // Return error
  }

  db.get('SELECT * FROM api_keys WHERE api_key = ?', [apiKey], (err, row) => {
    if (err) {
      console.error('Database error:', err); // Log database error
      return res.status(500).json({ error: 'Database error' }); // Return error
    }
    if (!row) {
      console.error('Invalid API key'); // Log error if the API key is invalid
      return res.status(401).json({ error: 'Invalid API key' }); // Return error
    }
    req.userId = row.user_id; // Attach the user ID associated with the API key to the request object
    next(); // Proceed to the next middleware
  });
};

// Middleware to verify if the user is an admin
const verifyAdmin = (req, res, next) => {
  db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, row) => {
    if (err || !row || row.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' }); // Return error if the user is not an admin
    }
    next(); // Proceed if the user is an admin
  });
};

// Middleware to enforce API usage limits based on the user's plan
const enforceApiUsageLimit = (req, res, next) => {
  db.get('SELECT plan FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(500).json({ error: 'Failed to fetch user data' }); // Return error if user data cannot be fetched
    }

    const tokenLimit = user.plan === 'basic' ? 1000 : 5000; // Determine token limit based on the user's plan
    const apiKey = req.headers['x-api-key']; // Retrieve the API key from the request headers

    // Check how many tokens have been used by this API key
    db.get(
      'SELECT SUM(tokens_used) AS tokens_used FROM api_usage WHERE api_key = ? AND DATE(created_at) = DATE("now")',
      [apiKey],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch API key usage data' }); // Return error if usage data cannot be fetched
        }

        const tokensUsed = row.tokens_used || 0; // Default to 0 if no tokens have been used

        if (tokensUsed >= tokenLimit) {
          return res.status(429).json({ error: 'Token usage limit reached for this API key today' }); // Return error if token limit is exceeded
        }

        // Log the API usage with token consumption and API key
        const tokensConsumed = req.tokensConsumed || 1; // Default to 1 token per request
        db.run(
          'INSERT INTO api_usage (user_id, endpoint, tokens_used, api_key, created_at) VALUES (?, ?, ?, ?, DATETIME("now"))',
          [req.userId, req.originalUrl, tokensConsumed, apiKey],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to log API usage' }); // Return error if logging fails
            }
            next(); // Proceed to the next middleware
          }
        );
      }
    );
  });
};

module.exports = { verifyToken, verifyApiKey, verifyAdmin, enforceApiUsageLimit };
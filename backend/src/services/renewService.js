const db = require('../config/database');

// Helper function to get the current local time in the format 'YYYY-MM-DD HH:mm:ss'
const getLocalTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// Function to renew API key limits and clear old API usage records
const renewApiKeyLimits = () => {
  // Reset API key limits based on user plans
  db.run(
    `UPDATE users
     SET api_key_limit = CASE
       WHEN plan = 'basic' THEN 5
       WHEN plan = 'pro' THEN 10
       WHEN plan = 'pro_plus' THEN 15
     END`,
    (err) => {
      if (err) {
        console.error('Error renewing API key limits:', err); // Log error if the update fails
      } else {
        console.log('API key limits renewed successfully.'); // Log success message
      }
    }
  );

  // Clear token usage records older than 24 hours based on local time
  const currentTime = getLocalTime();
  db.run(
    `DELETE FROM api_usage WHERE DATETIME(created_at) < DATETIME(?, '-24 hours')`,
    [currentTime],
    (err) => {
      if (err) {
        console.error('Error clearing old API usage records:', err); // Log error if deletion fails
      } else {
        console.log('Old API usage records cleared successfully.'); // Log success message
      }
    }
  );

  db.run(
    `DELETE FROM api_keys WHERE DATETIME(created_at) < DATETIME(?, '-24 hours')`,
    [currentTime],
    (err) => {
      if (err) {
        console.error('Error clearing old API key:', err); // Log error if deletion fails
      } else {
        console.log('Old API keys cleared successfully.'); // Log success message
      }
    }
  );
};

module.exports = { renewApiKeyLimits };

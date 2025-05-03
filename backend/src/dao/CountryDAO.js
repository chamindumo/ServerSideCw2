const db = require('../config/database');

class CountryDAO {
  static async logApiUsage(userId, endpoint, tokensUsed, apiKey) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO api_usage (user_id, endpoint, tokens_used, api_key, created_at) VALUES (?, ?, ?, ?, DATETIME("now"))',
        [userId, endpoint, tokensUsed, apiKey],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async getApiUsage(apiKey) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT SUM(tokens_used) AS tokens_used FROM api_usage WHERE api_key = ? AND DATE(created_at) = DATE("now")',
        [apiKey],
        (err, row) => {
          if (err) return reject(err);
          resolve(row.tokens_used || 0);
        }
      );
    });
  }
}

module.exports = CountryDAO;

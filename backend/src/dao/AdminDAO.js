const db = require('../config/database');

class AdminDAO {
  static async getAllUsers() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, username, role, plan, created_at FROM users', (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  static async getUserById(userId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, role, plan, created_at FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  static async getAllApiKeys() {
    return new Promise((resolve, reject) => {
      db.all('SELECT api_key, user_id, created_at, is_active FROM api_keys', (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  static async getAdminByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ? AND role = ?', [username, 'admin'], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  static async createUser(user) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password, role, plan, api_key_limit) VALUES (?, ?, ?, ?, ?)',
        [user.username, user.password, user.role || 'user', user.plan || 'basic', user.apiKeyLimit],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async updateUser(user) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET username = ?, role = ?, plan = ?, api_key_limit = ? WHERE id = ?',
        [user.username, user.role, user.plan, user.apiKeyLimit, user.id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }
}

module.exports = AdminDAO;

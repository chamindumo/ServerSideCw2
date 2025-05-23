const db = require('../config/database');

class UserDAO {
  static async getUserById(userId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  static async getUserByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  static async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  static async createUser(user) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (firstname, lastname, email, password, image_path) VALUES (?, ?, ?, ?, ?)',
        [user.firstname, user.lastname, user.email, user.password, user.imagePath],
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

  static async updateUserAccount(userId, updatedFields) {
    const { firstname, lastname, email, password, imagePath } = updatedFields;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users 
         SET firstname = ?, lastname = ?, email = ?, 
             password = COALESCE(?, password), 
             image_path = COALESCE(?, image_path) 
         WHERE id = ?`,
        [firstname, lastname, email, password, imagePath, userId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }

  static async deleteUser(userId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }

  static async getApiKeyCount(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) AS api_key_count FROM api_keys WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row.api_key_count || 0);
        }
      );
    });
  }

  static async insertApiKey(userId, apiKey) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO api_keys (user_id, api_key) VALUES (?, ?)',
        [userId, apiKey],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async searchUsers(query) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT id, firstname, lastname, email, image_path 
         FROM users 
         WHERE firstname LIKE ? OR lastname LIKE ? OR email LIKE ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = UserDAO;

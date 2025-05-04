const db = require('../config/database');

class BlogPostDAO {
  static async createPost(post) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO blog_posts (user_id, title, content, country, visit_date, likes, dislikes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [post.userId, post.title, post.content, post.country, post.visitDate, post.likes, post.dislikes],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async getPostById(postId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM blog_posts WHERE id = ?', [postId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  static async updatePost(post) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE blog_posts SET title = ?, content = ?, country = ?, visit_date = ?, likes = ?, dislikes = ? WHERE id = ? AND user_id = ?',
        [post.title, post.content, post.country, post.visitDate, post.likes, post.dislikes, post.id, post.userId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }

  static async deletePost(postId, userId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM blog_posts WHERE id = ? AND user_id = ?', [postId, userId], function (err) {
        if (err) return reject(err);
        resolve(this.changes);
      });
    });
  }

  static async getAllPosts(limit, offset, sortBy) {
    const orderBy = sortBy === 'most_liked' ? 'likes DESC' : 'created_at DESC';
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM blog_posts ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async searchPosts(query, limit, offset, sortBy) {
    const orderBy = sortBy === 'most_liked' ? 'likes DESC' : 'created_at DESC';
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM blog_posts WHERE country LIKE ? OR user_id IN (SELECT id FROM users WHERE user_id LIKE ?) ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
        [`%${query}%`, `%${query}%`, limit, offset],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = BlogPostDAO;

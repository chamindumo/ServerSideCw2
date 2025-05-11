const db = require('../config/database');

class BlogPostDAO {
  static async createPost(post) {
    return new Promise((resolve, reject) => {
      const createdAt = new Date().toISOString(); // Get local time in ISO format
      db.run(
        `INSERT INTO blog_posts (user_id, title, content, country, visit_date, likes, dislikes, image_path, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [post.userId, post.title, post.content, post.country, post.visitDate, 0, 0, post.imagePath, createdAt],
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
        `UPDATE blog_posts 
         SET title = ?, content = ?, country = ?, visit_date = ?, likes = ?, dislikes = ?, image_path = COALESCE(?, image_path)
         WHERE id = ? AND user_id = ?`,
        [post.title, post.content, post.country, post.visitDate, post.likes, post.dislikes, post.imagePath, post.id, post.userId],
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

  static async searchPosts(query) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT blog_posts.*, 
                (users.firstname || ' ' || users.lastname) AS posterName 
         FROM blog_posts 
         INNER JOIN users ON blog_posts.user_id = users.id 
         WHERE blog_posts.country LIKE ? OR users.firstname LIKE ? OR users.lastname LIKE ?`,
        [`%${query}%`, `%${query}%`, `%${query}%`],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async getBlogsByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM blog_posts WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async getLikesCount(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT SUM(likes) AS totalLikes FROM blog_posts WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row.totalLikes || 0);
        }
      );
    });
  }
}

module.exports = BlogPostDAO;

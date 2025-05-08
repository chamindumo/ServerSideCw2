const db = require('../config/database');

class CommentDAO {
  static async addComment(postId, userId, content) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, DATETIME("now"))',
        [postId, userId, content],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async getCommentsByPost(postId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT comments.*, 
                users.firstname || ' ' || users.lastname AS username 
         FROM comments 
         INNER JOIN users ON comments.user_id = users.id 
         WHERE comments.post_id = ? 
         ORDER BY comments.created_at DESC`,
        [postId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async toggleLikeDislike(postId, isLike) {
    return new Promise((resolve, reject) => {
      const column = isLike ? 'likes' : 'dislikes';
      db.run(
        `UPDATE blog_posts SET ${column} = ${column} + 1 WHERE id = ?`,
        [postId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }
}

module.exports = CommentDAO;

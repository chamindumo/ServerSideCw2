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

  static async getUserReaction(postId, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT is_like FROM user_likes_dislikes WHERE post_id = ? AND user_id = ?',
        [postId, userId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row ? row.is_like : null);
        }
      );
    });
  }

  static async toggleLikeDislike(postId, userId, isLike) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Begin transaction
        db.run('BEGIN TRANSACTION');

        // Check if user has already liked/disliked
        db.get(
          'SELECT * FROM user_likes_dislikes WHERE post_id = ? AND user_id = ?',
          [postId, userId],
          (err, row) => {
            if (err) {
              db.run('ROLLBACK');
              return reject(err);
            }

            if (row) {
              // User has already acted on this post
              if ((row.is_like && isLike) || (!row.is_like && !isLike)) {
                // Remove the like/dislike
                db.run(
                  'DELETE FROM user_likes_dislikes WHERE post_id = ? AND user_id = ?',
                  [postId, userId],
                  (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return reject(err);
                    }

                    const column = isLike ? 'likes' : 'dislikes';
                    db.run(
                      `UPDATE blog_posts SET ${column} = ${column} - 1 WHERE id = ?`,
                      [postId],
                      function (err) {
                        if (err) {
                          db.run('ROLLBACK');
                          return reject(err);
                        }
                        db.run('COMMIT');
                        resolve({ action: 'removed' });
                      }
                    );
                  }
                );
              } else {
                db.run('ROLLBACK');
                reject(new Error('User has already acted on this post'));
              }
            } else {
              // Add new like/dislike
              db.run(
                'INSERT INTO user_likes_dislikes (post_id, user_id, is_like) VALUES (?, ?, ?)',
                [postId, userId, isLike],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject(err);
                  }

                  const column = isLike ? 'likes' : 'dislikes';
                  db.run(
                    `UPDATE blog_posts SET ${column} = ${column} + 1 WHERE id = ?`,
                    [postId],
                    function (err) {
                      if (err) {
                        db.run('ROLLBACK');
                        return reject(err);
                      }
                      db.run('COMMIT');
                      resolve({ action: 'added' });
                    }
                  );
                }
              );
            }
          }
        );
      });
    });
  }
}

module.exports = CommentDAO;

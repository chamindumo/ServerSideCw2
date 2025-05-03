const db = require('../config/database');

class FollowDAO {
  static async followUser(followerId, followingId) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
        [followerId, followingId],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }

  static async unfollowUser(followerId, followingId) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes);
        }
      );
    });
  }

  static async getFollowedPosts(userId, limit, offset) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM blog_posts WHERE user_id IN (SELECT following_id FROM follows WHERE follower_id = ?) ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }
}

module.exports = FollowDAO;

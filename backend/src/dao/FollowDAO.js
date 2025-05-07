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

  static async isFollowing(followerId, followingId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) AS count FROM follows WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row.count > 0);
        }
      );
    });
  }

  static async getFollowers(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT users.id, 
                (users.firstname || ' ' || users.lastname) AS name, 
                users.email,
                users.image_path 
         FROM users 
         INNER JOIN follows ON users.id = follows.following_id 
         WHERE follows.follower_id = ?`,
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  static async getFollowersCount(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?',
        [userId],
        (err, row) => {
          if (err) return reject(err);
          resolve(row.count);
        }
      );
    });
  }
}

module.exports = FollowDAO;

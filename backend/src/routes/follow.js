const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const { verifyToken } = require('../middleware/auth');

// All routes require CSRF token validation
router.use((req, res, next) => {
  req.csrfToken(); // CSRF token validation middleware
  next();
});

/**
 * @swagger
 * /follow/{id}/follow:
 *   post:
 *     summary: Follow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed the user
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:id/follow', verifyToken, followController.followUser);

/**
 * @swagger
 * /follow/{id}/unfollow:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id/unfollow', verifyToken, followController.unfollowUser);

/**
 * @swagger
 * /follow/feed:
 *   get:
 *     summary: Get posts from followed users
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 

 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of posts to retrieve
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of posts to skip
 *     responses:
 *       200:
 *         description: List of posts from followed users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/feed', verifyToken, followController.getFollowedPosts);

/**
 * @swagger
 * /follow/{id}/status:
 *   get:
 *     summary: Check if the current user is following another user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to check follow status
 *     responses:
 *       200:
 *         description: Follow status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/status', verifyToken, followController.checkFollowStatus);

/**
 * @swagger
 * /follow/{id}/followers:
 *   get:
 *     summary: Get the list of users following a specific user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get followers for
 *     responses:
 *       200:
 *         description: List of followers retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/followers', verifyToken, followController.getFollowers);

/**
 * @swagger
 * /follow/{id}/followings:
 *   get:
 *     summary: Get the list of users followed by a specific user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get followings for
 *     responses:
 *       200:
 *         description: List of followings retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/followings', verifyToken, followController.getFollowings);

module.exports = router;

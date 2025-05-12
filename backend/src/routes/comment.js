const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/auth');

// All routes require CSRF token validation
router.use((req, res, next) => {
  req.csrfToken();
  next();
});

/**
 * @swagger
 * /comment/{postId}:
 *   post:
 *     summary: Add a comment to a blog post
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 

 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the blog post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 *       404:
 *         description: Blog post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:postId', verifyToken, commentController.addComment);

/**
 * @swagger
 * /comment/{postId}:
 *   get:
 *     summary: Get comments for a blog post
 *     tags: [Comment]
 *     security:
 *       - csrfAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the blog post
 *     responses:
 *       200:
 *         description: List of comments for the blog post
 *       403:
 *         description: Invalid CSRF token
 *       500:
 *         description: Server error
 */
router.get('/:postId', (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, commentController.getComments);

/**
 * @swagger
 * /comment/{postId}/like:
 *   post:
 *     summary: Like a blog post
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 

 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the blog post
 *     responses:
 *       200:
 *         description: Blog post liked successfully
 *       404:
 *         description: Blog post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:postId/like', verifyToken, commentController.likePost);

/**
 * @swagger
 * /comment/{postId}/dislike:
 *   post:
 *     summary: Dislike a blog post
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 

 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the blog post
 *     responses:
 *       200:
 *         description: Blog post disliked successfully
 *       404:
 *         description: Blog post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:postId/dislike', verifyToken, commentController.dislikePost);

/**
 * @swagger
 * /comment/{postId}/reaction:
 *   get:
 *     summary: Get user's reaction to a blog post
 *     tags: [Comment]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the blog post
 *     responses:
 *       200:
 *         description: User's reaction status
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:postId/reaction', verifyToken, commentController.getUserReaction);

module.exports = router;

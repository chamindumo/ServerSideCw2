const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { verifyToken } = require('../middleware/auth');

// All routes require CSRF token validation
router.use((req, res, next) => {
  req.csrfToken();
  next();
});

/**
 * @swagger
 * /blog:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 
 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               country:
 *                 type: string
 *               visitDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, blogController.createPost);

/**
 * @swagger
 * /blog/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 
 
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               country:
 *                 type: string
 *               visitDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *       404:
 *         description: Blog post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, blogController.updatePost);

/**
 * @swagger
 * /blog/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *       - csrfAuth: [] 

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *       404:
 *         description: Blog post not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, blogController.deletePost);

/**
 * @swagger
 * /blog:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Blog]
 *     security:
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, most_liked]
 *         description: Sorting criteria
 *     responses:
 *       200:
 *         description: List of blog posts
 *       403:
 *         description: Invalid CSRF token
 *       500:
 *         description: Server error
 */
router.get('/', (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, blogController.getAllPosts);

/**
 * @swagger
 * /blog/search:
 *   get:
 *     summary: Search blog posts
 *     tags: [Blog]
 *     security:
 *       - csrfAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Search query
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, most_liked]
 *         description: Sorting criteria
 *     responses:
 *       200:
 *         description: List of matching blog posts
 *       403:
 *         description: Invalid CSRF token
 *       500:
 *         description: Server error
 */
router.get('/search', (req, res, next) => {
  req.csrfToken(); // Validate CSRF token
  next();
}, blogController.searchPosts);

/**
 * @swagger
 * /blog/{id}:
 *   get:
 *     summary: Get a blog post by ID
 *     tags: [Blog]
 *     security:
 *       - csrfAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog post ID
 *     responses:
 *       200:
 *         description: Blog post retrieved successfully
 *       404:
 *         description: Blog post not found
 *       500:
 *         description: Server error
 */
router.get('/:id', blogController.getPostById);

module.exports = router;

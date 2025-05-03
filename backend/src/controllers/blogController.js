const BlogPostDAO = require('../dao/BlogPostDAO');

exports.createPost = async (req, res) => {
  const { title, content, country, visitDate } = req.body;

  try {
    const postId = await BlogPostDAO.createPost({
      userId: req.userId,
      title,
      content,
      country,
      visitDate,
    });
    res.status(201).json({ message: 'Blog post created successfully', postId });
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
};

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, country, visitDate } = req.body;

  try {
    const changes = await BlogPostDAO.updatePost({
      id,
      userId: req.userId,
      title,
      content,
      country,
      visitDate,
    });
    if (changes === 0) return res.status(404).json({ error: 'Blog post not found' });
    res.json({ message: 'Blog post updated successfully' });
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const changes = await BlogPostDAO.deletePost(id, req.userId);
    if (changes === 0) return res.status(404).json({ error: 'Blog post not found' });
    res.json({ message: 'Blog post deleted successfully' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
};

exports.getAllPosts = async (req, res) => {
  const { limit = 10, offset = 0, sortBy = 'newest' } = req.query;

  try {
    const posts = await BlogPostDAO.getAllPosts(parseInt(limit), parseInt(offset), sortBy);
    res.json(posts);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
};

exports.searchPosts = async (req, res) => {
  const { query, limit = 10, offset = 0, sortBy = 'newest' } = req.query;

  try {
    const posts = await BlogPostDAO.searchPosts(query, parseInt(limit), parseInt(offset), sortBy);
    res.json(posts);
  } catch (err) {
    console.error('Error searching blog posts:', err);
    res.status(500).json({ error: 'Failed to search blog posts' });
  }
};

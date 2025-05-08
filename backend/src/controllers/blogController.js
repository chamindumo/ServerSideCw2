const BlogPostDAO = require('../dao/BlogPostDAO');
const UserDAO = require('../dao/UserDAO'); // Import UserDAO
const axios = require('axios');

exports.createPost = async (req, res) => {
  const { title, content, country, visitDate } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Ensure the uploaded image path is captured
  console.log('Image path:', imagePath); // Debugging line to check the image path
  try {
    const postId = await BlogPostDAO.createPost({
      userId: req.userId,
      title,
      content,
      country,
      visitDate,
      imagePath, // Pass the image path to the DAO
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
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null; // Get the uploaded image path

  try {
    const changes = await BlogPostDAO.updatePost({
      id,
      userId: req.userId,
      title,
      content,
      country,
      visitDate,
      imagePath, // Include the new image path
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
    res.json(posts.map(post => ({
      ...post,
      image_path: post.image_path ? `http://localhost:3000${post.image_path}` : null, // Prefix the image path with the server URL
    })));
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
};

exports.searchPosts = async (req, res) => {
  const { query } = req.query;

  try {
    const posts = await BlogPostDAO.searchPosts(query);
    res.json(posts);
  } catch (err) {
    console.error("Error searching blog posts:", err);
    res.status(500).json({ error: "Failed to search blog posts" });
  }
};

exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await BlogPostDAO.getPostById(id);
    if (!post) return res.status(404).json({ error: 'Blog post not found' });

    // Fetch the country flag URL
    const countryResponse = await axios.get(`https://restcountries.com/v3.1/name/${post.country}`);
    const countryData = countryResponse.data[0];
    const flagUrl = countryData?.flags?.png || null;

    // Fetch the user's full name and image
    const user = await UserDAO.getUserById(post.user_id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      ...post,
      flagUrl,
      image_path: post.image_path ? `http://localhost:3000${post.image_path}` : null, // Prefix the image path with the server URL
      posterName: `${user.firstname} ${user.lastname}`,
      posterImage: user.image_path ? `http://localhost:3000${user.image_path}` : null,
    });
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
};

exports.getBlogsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const blogs = await BlogPostDAO.getBlogsByUserId(userId);
    if (blogs.length === 0) {
      return res.status(404).json({ error: 'No blogs found for this user' });
    }

    res.json(blogs.map(blog => ({
      ...blog,
      image_path: blog.image_path ? `http://localhost:3000${blog.image_path}` : null, // Prefix the image path with the server URL
    })));
  } catch (err) {
    console.error('Error fetching blogs by user:', err);
    res.status(500).json({ error: 'Failed to fetch blogs by user' });
  }
};

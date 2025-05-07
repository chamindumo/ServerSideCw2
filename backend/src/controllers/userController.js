const UserDAO = require('../dao/UserDAO');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const FollowDAO = require('../dao/FollowDAO');
const BlogPostDAO = require('../dao/BlogPostDAO');

exports.register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : '/uploads/1746546809052-no-image-icon-23485.png';

  if (!firstname || !lastname || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserDAO.createUser({ firstname, lastname, email, password: hashedPassword, imagePath });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await UserDAO.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await UserDAO.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove sensitive information
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

exports.getUserStats = async (req, res) => {
  const { id: userId } = req.params;

  try {
    const followersCount = await FollowDAO.getFollowersCount(userId);
    const likesCount = await BlogPostDAO.getLikesCount(userId);

    res.json({ followers: followersCount, likes: likesCount });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
};

exports.updateAccount = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!firstname || !lastname || !email) {
    return res.status(400).json({ error: 'First name, last name, and email are required' });
  }

  try {
    const updatedFields = { firstname, lastname, email };
    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }
    if (imagePath) {
      updatedFields.imagePath = imagePath;
    }

    const changes = await UserDAO.updateUserAccount(req.userId, updatedFields);
    if (changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account updated successfully' });
  } catch (err) {
    console.error('Error updating account:', err);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

exports.searchUsers = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }

  try {
    const users = await UserDAO.searchUsers(query);
    res.json(users);
  } catch (err) {
    console.error("Error searching users:", err);
    res.status(500).json({ error: "Failed to search users" });
  }
};

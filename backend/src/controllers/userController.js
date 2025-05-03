const UserDAO = require('../dao/UserDAO');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { renewApiKeyLimits } = require('../services/renewService');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await UserDAO.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

exports.updateProfile = async (req, res) => {
  const { username, plan } = req.body;
  const validPlans = ['basic', 'pro', 'pro_plus'];
  if (!validPlans.includes(plan)) return res.status(400).json({ error: 'Invalid plan specified' });

  try {
    const changes = await UserDAO.updateUser({ id: req.userId, username, plan, apiKeyLimit: plan === 'basic' ? 5 : plan === 'pro' ? 10 : 15 });
    if (changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User profile updated successfully' });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

exports.generateApiKey = async (req, res) => {
  renewApiKeyLimits();

  try {
    const user = await UserDAO.getUserById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const apiKeyCount = await UserDAO.getApiKeyCount(req.userId);
    if (user.apiKeyLimit <= apiKeyCount) {
      return res.status(400).json({ error: 'API key limit reached for your plan.' });
    }

    const apiKey = crypto.randomBytes(16).toString('hex');
    await UserDAO.insertApiKey(req.userId, apiKey);
    res.json({ api_key: apiKey });
  } catch (err) {
    console.error('Error generating API key:', err);
    res.status(500).json({ error: 'Failed to generate API key' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = await UserDAO.getUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const apiKeyCount = await UserDAO.getApiKeyCount(user.id);

    res.json({ token, apiKeyCount });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

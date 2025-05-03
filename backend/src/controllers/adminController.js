const AdminDAO = require('../dao/AdminDAO');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await AdminDAO.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await AdminDAO.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.createUser = async (req, res) => {
  const { username, password, role, plan } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = await AdminDAO.createUser({ username, password: hashedPassword, role, plan });
    res.status(201).json({ id: userId, message: 'User created successfully' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ error: 'Failed to create user' });
  }
};

exports.updateUser = async (req, res) => {
  const { username, role, plan } = req.body;

  try {
    const changes = await AdminDAO.updateUser({ id: req.params.id, username, role, plan });
    if (changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const changes = await AdminDAO.deleteUser(req.params.id);
    if (changes === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.getAllApiKeys = async (req, res) => {
  try {
    const apiKeys = await AdminDAO.getAllApiKeys();
    res.json(apiKeys);
  } catch (err) {
    console.error('Error fetching API keys:', err);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
};

exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const admin = await AdminDAO.getAdminByUsername(username);
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Error during admin login:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
};

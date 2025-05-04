const jwt = require('jsonwebtoken');

// Middleware to verify the JWT token and CSRF
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  const csrfToken = req.headers["x-csrf-token"];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    req.csrfToken(); // Validate CSRF token
  } catch (err) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.userId = decoded.id;
    next();
  });
};

module.exports = { verifyToken };
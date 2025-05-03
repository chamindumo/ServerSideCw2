require('dotenv').config();
const express = require('express');
const cors = require('cors');
const csrf = require('csurf'); // Add CSRF middleware
const cookieParser = require('cookie-parser'); // Required for CSRF cookies
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const authRoutes = require('./src/routes/auth');
const countryRoutes = require('./src/routes/countries');
const adminRoutes = require('./src/routes/admin');
const userRoutes = require('./src/routes/user');
const blogRoutes = require('./src/routes/blog'); // Blog post routes
const followRoutes = require('./src/routes/follow'); // User following routes
const commentRoutes = require('./src/routes/comment'); // Comment routes
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session); // Use SQLite for session storage
const db = require('./src/config/database'); // Import the database connection
const csrfService = require('./src/services/csrfService');
const cron = require('node-cron');
const { renewApiKeyLimits } = require('./src/services/renewService');

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Country API Middleware',
      version: '1.0.0',
      description: 'A secure API middleware service interfacing with RestCountries.com',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        csrfAuth: { // Add CSRF authentication scheme
          type: 'apiKey',
          in: 'header',
          name: 'x-csrf-token',
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Paths to files with Swagger annotations
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Allow requests from the frontend
  credentials: true, // Allow cookies to be sent with requests
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies for CSRF
app.use(csrf({ cookie: true })); // Enable CSRF protection
app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }), // Store sessions in sessions.sqlite
    secret: process.env.SESSION_SECRET || 'temporary-secret', // Use a secure secret
    resave: false, // Avoid resaving unchanged sessions
    saveUninitialized: true, // Save uninitialized sessions to the database
    cookie: {
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// CSRF error handling middleware
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});

// CSRF token generation endpoint
app.get('/auth/csrf-token', async (req, res) => {
  const previousCsrfToken = req.session.csrfToken; // Retrieve the previous CSRF token
  const csrfToken = req.csrfToken(); // Generate a new CSRF token
  req.session.csrfToken = csrfToken; // Save the new CSRF token in the session

  // Store the previous CSRF token in the database if it exists
  if (previousCsrfToken) {
    try {
      await csrfService.storePreviousCsrfToken(req.sessionID, previousCsrfToken);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to store previous CSRF token' });
    }
  }

  // Set the new CSRF token in a cookie
  res.cookie('csrfToken', csrfToken, { httpOnly: true, secure: false });
  res.json({ csrfToken });
});

// Swagger UI setup
if (process.env.NODE_ENV !=='production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  console.log('Swagger docs available at http://localhost:3000/api-docs');
} else {
  console.log('Swagger is disabled in production mode.');
}

// Routes
app.use('/auth', authRoutes);
app.use('/countries', countryRoutes);
app.use('/admin', adminRoutes); // Admin-specific routes
app.use('/user', userRoutes); // User-specific routes
app.use('/blog', blogRoutes); // Blog post routes
app.use('/follow', followRoutes); // User following routes
app.use('/comment', commentRoutes); // Comment routes

// Schedule a daily task to renew API key limits and reset token usage
cron.schedule('0 0 * * *', () => {
  console.log('Running daily API key limit and token usage renewal...');
  renewApiKeyLimits(); // Renew API key limits and clear old token usage
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
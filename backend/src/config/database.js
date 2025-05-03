// config/database.js
const sqlite3 = require('sqlite3').verbose();

// Use the DATABASE_FILE environment variable to determine the database file
const dbFile = process.env.NODE_ENV === 'production' ? 'country_api_prod.db' : 'country_api.db';
const db = new sqlite3.Database(dbFile);

// Helper function to get the current date and time in the server's local timezone
const getLocalTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

db.serialize(() => {
  // Create the users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user', 
      plan TEXT DEFAULT 'basic', 
      api_key_limit INTEGER DEFAULT 50, 
      created_at DATETIME DEFAULT '${getLocalTime()}' 
    )
  `);

  // Create the api_keys table
  db.run(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL, 
      api_key TEXT UNIQUE NOT NULL, 
      is_active INTEGER DEFAULT 1, 
      created_at DATETIME DEFAULT '${getLocalTime()}', 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE )
  `);

  // Create the csrf_tokens table
  db.run(`
    CREATE TABLE IF NOT EXISTS csrf_tokens (
      session_id TEXT PRIMARY KEY, 
      csrf_token TEXT NOT NULL,
      created_at DATETIME DEFAULT '${getLocalTime()}')
  `);

  // Create the api_usage table to track API usage
  db.run(`
    CREATE TABLE IF NOT EXISTS api_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      endpoint TEXT NOT NULL, 
      created_at DATETIME DEFAULT '${getLocalTime()}', 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE 
    )
  `);

  // Add tokens_used column to api_usage table if it doesn't exist
  db.run(`
    ALTER TABLE api_usage ADD COLUMN tokens_used INTEGER DEFAULT 0
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding tokens_used column:', err); // Log error if the column addition fails
    }
  });

  // Create the blog_posts table
  db.run(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      country TEXT NOT NULL,
      visit_date DATE NOT NULL,
      likes INTEGER DEFAULT 0,
      dislikes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT '${getLocalTime()}',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create the comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT '${getLocalTime()}',
      FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create the follows table
  db.run(`
    CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      follower_id INTEGER NOT NULL,
      following_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT '${getLocalTime()}',
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
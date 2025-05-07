// config/database.js
const sqlite3 = require('sqlite3').verbose();

// Use the DATABASE_FILE environment variable to determine the database file
const dbFile = process.env.NODE_ENV === 'production' ? 'country_api_prod.db' : 'country_api.db';
const db = new sqlite3.Database(dbFile);

// Helper function to get the current date and time in the server's local timezone
const getLocalTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

db.serialize(() => {
  // Create the users table with the required columns
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstname TEXT NOT NULL,
      lastname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add new columns to the users table if they do not already exist
  db.run(`ALTER TABLE users ADD COLUMN firstname TEXT NOT NULL DEFAULT ''`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding firstname column:', err);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN lastname TEXT NOT NULL DEFAULT ''`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding lastname column:', err);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN email TEXT UNIQUE NOT NULL DEFAULT ''`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding email column:', err);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN password TEXT NOT NULL DEFAULT ''`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding password column:', err);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding created_at column:', err);
    }
  });

  db.run(`ALTER TABLE users ADD COLUMN image_path TEXT DEFAULT '/uploads/1746546809052-no-image-icon-23485.png'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding image_path column:', err);
    }
  });

  // Create the csrf_tokens table
  db.run(`
    CREATE TABLE IF NOT EXISTS csrf_tokens (
      session_id TEXT PRIMARY KEY, 
      csrf_token TEXT NOT NULL,
      created_at DATETIME DEFAULT '${getLocalTime()}')
  `);

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

  // Ensure the likes and dislikes columns exist in the blog_posts table
  db.run(`ALTER TABLE blog_posts ADD COLUMN likes INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding likes column:', err);
    }
  });

  db.run(`ALTER TABLE blog_posts ADD COLUMN dislikes INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding dislikes column:', err);
    }
  });

  // Add the image_path column to the blog_posts table
  db.run(`ALTER TABLE blog_posts ADD COLUMN image_path TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding image_path column:', err);
    }
  });

  

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
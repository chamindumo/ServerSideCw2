const db = require('../config/database');

// Function to store the previous CSRF token in the database
const storePreviousCsrfToken = (sessionId, csrfToken) => {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO csrf_tokens (session_id, csrf_token) VALUES (?, ?) ON CONFLICT(session_id) DO UPDATE SET csrf_token = ?',
      [sessionId, csrfToken, csrfToken], // Insert or update the CSRF token for the session
      (err) => {
        if (err) {
          console.error('Error storing CSRF token in database:', err); // Log error if the operation fails
          return reject(err); // Reject the promise with the error
        }
        console.log('Previous CSRF token stored successfully:', csrfToken); // Log success message
        resolve(); // Resolve the promise
      }
    );
  });
};

module.exports = { storePreviousCsrfToken };

const bcrypt = require('bcrypt');
const db = require('./db'); // Adjust the path to your database connection file

async function hashPasswords() {
    const users = await db.all('SELECT * FROM users');
    for (const user of users) {
        if (!user.password.startsWith('$2b$')) { // Check if the password is already hashed
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, user.username]);
        }
    }
    console.log('Passwords updated successfully.');
}

hashPasswords().catch(err => console.error(err));

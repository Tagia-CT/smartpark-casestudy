const db = require('../config/database');

class User {
    // Mencari user berdasarkan email (Dipakai saat Login)
    static async findByEmail(email) {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Menyimpan user baru (Dipakai saat Register)
    static async create(username, email, passwordHash, role = 'USER') {
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, passwordHash, role]
        );
        return result.insertId;
    }
}

module.exports = User;
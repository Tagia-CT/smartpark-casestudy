const mysql = require('mysql2');
const dotenv = require('dotenv');

// Memuat konfigurasi dari file .env
dotenv.config();

// Membuat Pool Koneksi
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Mengubahnya menjadi Promise agar bisa menggunakan async/await
const db = pool.promise();

module.exports = db;
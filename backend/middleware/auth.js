const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const verifyToken = (req, res, next) => {
    // Ambil token dari header "Authorization"
    const authHeader = req.headers['authorization'];

    // Kita pisahkan kata "Bearer" dan ambil tokennya saja
    const token = authHeader && authHeader.split(' ')[1];

    // Jika tidak ada token, tolak akses
    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak! Token tidak ditemukan.' });
    }

    try {
        // Cek keaslian token menggunakan Kunci Rahasia
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Jika asli, simpan data user ke dalam request agar bisa dipakai file lain
        req.user = decoded;

        // Lanjut ke proses berikutnya
        next();
    } catch (error) {
        // Jika token palsu atau kadaluarsa
        return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa.' });
    }
};

module.exports = verifyToken;
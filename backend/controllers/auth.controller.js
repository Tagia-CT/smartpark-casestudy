const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// LOGIKA REGISTER
exports.register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Cek apakah email sudah terdaftar
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        // Enkripsi password (Hashing)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Simpan user baru ke database
        // Jika role tidak diisi, otomatis jadi USER
        const finalRole = role === 'ADMIN' ? 'ADMIN' : 'USER';

        await User.create(username, email, passwordHash, finalRole);

        res.status(201).json({ message: 'Registrasi berhasil! Silakan login.' });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};

// LOGIKA LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cari user berdasarkan email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Email atau password salah' });
        }

        // Cek password (Bandingkan input vs Hash di DB)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah' });
        }

        // Buat Token JWT (Kartu Akses)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
    }
};
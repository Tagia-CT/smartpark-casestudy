const isAdmin = (req, res, next) => {
    // Cek apakah data user sudah ada (dari auth.js) DAN rolenya adalah ADMIN
    if (req.user && req.user.role === 'ADMIN') {
        // Jika ya, silakan lewat
        next();
    } else {
        // Jika bukan Admin, tolak
        res.status(403).json({ message: 'Akses terlarang! Halaman ini khusus Admin.' });
    }
};

module.exports = isAdmin;
const db = require('../config/database');

exports.bookSpot = async (req, res) => {
    try {
        const { spotId } = req.body;
        const userId = req.user.id; 

        // 1. Cek User Punya Booking Aktif?
        const [existingBooking] = await db.execute(
            'SELECT * FROM parking_spots WHERE user_id = ? AND status IN ("RESERVED", "OCCUPIED")',
            [userId]
        );

        if (existingBooking.length > 0) {
            return res.status(400).json({ 
                message: 'Anda sudah memiliki booking aktif! Selesaikan atau batalkan yang lama dulu.' 
            });
        }

        // 2. Cek Slot Available?
        const [spots] = await db.execute('SELECT * FROM parking_spots WHERE id = ?', [spotId]);
        if (spots.length === 0) return res.status(404).json({ message: 'Slot tidak ditemukan' });
        
        const spot = spots[0];
        if (spot.status !== 'AVAILABLE') {
            return res.status(400).json({ message: 'Maaf, slot ini baru saja diambil orang lain!' });
        }

        // 3. Eksekusi Booking
        await db.execute(
            'UPDATE parking_spots SET status = "RESERVED", user_id = ?, booking_time = NOW() WHERE id = ?', 
            [userId, spotId]
        );

        // --- PERBAIKAN DI SINI ---
        // Ambil data terbaru yang lengkap (termasuk booking_time yang baru dibuat MySQL)
        const [updatedSpot] = await db.execute('SELECT * FROM parking_spots WHERE id = ?', [spotId]);
        
        // Kirim data LENGKAP ke frontend
        global.io.emit('spotUpdate', updatedSpot[0]);

        res.json({ message: 'Booking berhasil! Slot telah diamankan untuk Anda.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.cancelBooking = async (req, res) => {
    try {
        const { spotId } = req.body;
        const userId = req.user.id;

        // Validasi kepemilikan
        const [spots] = await db.execute(
            'SELECT * FROM parking_spots WHERE id = ? AND user_id = ?', 
            [spotId, userId]
        );

        if (spots.length === 0) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses untuk membatalkan slot ini.' });
        }

        // Reset Slot
        await db.execute(
            'UPDATE parking_spots SET status = "AVAILABLE", user_id = NULL, booking_time = NULL WHERE id = ?', 
            [spotId]
        );
        
        // Broadcast data reset yang lengkap
        // Kita kirim manual object-nya karena kita tahu nilainya NULL
        global.io.emit('spotUpdate', { 
            id: spotId, 
            status: 'AVAILABLE', 
            user_id: null, 
            booking_time: null 
        });
        
        res.json({ message: 'Booking berhasil dibatalkan.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
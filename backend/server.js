const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const cron = require('node-cron');
const db = require('./config/database');


const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/lots', userRoutes);

// Test Route 
app.get('/', (req, res) => {
    res.send('API SmartPark is Running... ');
});

// Definisi Port
const PORT = process.env.PORT || 5000;

// Jalankan Server
const server = app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

// Handle error jika port dipakai
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log('Port sedang digunakan, mencoba port lain...');
        setTimeout(() => {
            server.close();
            server.listen(PORT + 1);
        }, 1000);
    }
});

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

global.io = io;

io.on('connection', (socket) => {
    console.log('User terkoneksi ke Socket.IO:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnect:', socket.id);
    });
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        setTimeout(() => {
            server.close();
            server.listen(PORT + 1);
        }, 1000);
    }
});

cron.schedule('* * * * *', async () => {
    console.log('Satpam Cron: Mengecek booking kadaluarsa...');

    try {
        const [expiredSpots] = await db.execute(
            `SELECT * FROM parking_spots 
             WHERE status = 'RESERVED' 
             AND booking_time < (NOW() - INTERVAL 1 MINUTE)`
        );

        if (expiredSpots.length > 0) {
            console.log(`Satpam Cron: Menemukan ${expiredSpots.length} booking hangus.`);

            // Loop setiap slot yang hangus untuk dibersihkan
            for (const spot of expiredSpots) {
                await db.execute(
                    'UPDATE parking_spots SET status = "AVAILABLE", user_id = NULL, booking_time = NULL WHERE id = ?',
                    [spot.id]
                );

                // Kita kirim status AVAILABLE agar warna kembali Hijau
                io.emit('spotUpdate', { id: spot.id, status: 'AVAILABLE' });
                
                console.log(`>> Slot ${spot.spot_number} di-reset otomatis.`);
            }
        }
    } catch (error) {
        console.error('Satpam Cron Error:', error);
    }
});
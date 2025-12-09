const db = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('Memulai proses seeding database...');

        // Bersihkan tabel lama (Urutan penting karena Foreign Key)
        // Hapus spots dulu, baru lots dan users
        await db.query("DROP TABLE IF EXISTS parking_spots");
        await db.query("DROP TABLE IF EXISTS parking_lots");
        await db.query("DROP TABLE IF EXISTS users");
        console.log('Tabel lama berhasil dibersihkan.');

        // Buat Tabel Users
        const createUserTable = `
            CREATE TABLE users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('USER', 'ADMIN') DEFAULT 'USER',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(createUserTable);
        console.log('Tabel users dibuat.');

        // Buat Tabel Parking Lots
        const createLotTable = `
            CREATE TABLE parking_lots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                total_capacity INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(createLotTable);
        console.log('Tabel parking_lots dibuat.');

        // Buat Tabel Parking Spots (Dengan Foreign Key)
        const createSpotTable = `
            CREATE TABLE parking_spots (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lot_id INT NOT NULL,
                spot_number VARCHAR(10) NOT NULL,
                status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED') DEFAULT 'AVAILABLE',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (lot_id) REFERENCES parking_lots(id) ON DELETE CASCADE
            )
        `;
        await db.query(createSpotTable);
        console.log('Tabel parking_spots dibuat.');

        // Isi Data Dummy: Users (Admin & User)
        // Hash password sebelum disimpan
        const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
        const hashedPasswordUser = await bcrypt.hash('user123', 10);

        const insertUsers = `
            INSERT INTO users (username, email, password_hash, role) VALUES 
            ('admin_utama', 'admin@smartpark.com', ?, 'ADMIN'),
            ('user_biasa', 'user@smartpark.com', ?, 'USER')
        `;
        await db.query(insertUsers, [hashedPasswordAdmin, hashedPasswordUser]);
        console.log('Data dummy Users berhasil dimasukkan.');

        // Isi Data Dummy: Parking Lots
        const insertLots = `
            INSERT INTO parking_lots (name, total_capacity) VALUES 
            ('Mall Grand Indonesia - Lantai 1', 20),
            ('Mall Grand Indonesia - Basement', 15)
        `;
        await db.query(insertLots);
        console.log('Data dummy Parking Lots berhasil dimasukkan.');

        // Isi Data Dummy: Parking Spots (Otomatis generate slot)
        // Ambil ID lot yang baru dibuat
        const [lots] = await db.query("SELECT id, total_capacity FROM parking_lots");

        for (const lot of lots) {
            let spotValues = [];
            // Generate slot A1, A2... atau B1, B2...
            const prefix = lot.id === 1 ? 'A' : 'B';

            for (let i = 1; i <= 15; i++) { // Masukkan 15 slot per lot
                // Set beberapa slot jadi OCCUPIED untuk simulasi awal
                const status = (i === 2 || i === 5) ? 'OCCUPIED' : 'AVAILABLE';
                spotValues.push([lot.id, `${prefix}${i}`, status]);
            }

            // Bulk insert untuk efisiensi
            await db.query(
                "INSERT INTO parking_spots (lot_id, spot_number, status) VALUES ?",
                [spotValues]
            );
        }
        console.log('Data dummy Parking Spots berhasil digenerate (15 slot/lot).');

        console.log('SEEDING SELESAI! Database siap digunakan.');
        process.exit(); // Tutup proses
    } catch (error) {
        console.error('Gagal melakukan seeding:', error);
        process.exit(1); // Tutup dengan error
    }
};

seedDatabase();


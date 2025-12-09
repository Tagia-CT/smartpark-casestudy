const db = require('../config/database');

class ParkingLot {
    // ambil semua lot
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM parking_lots ORDER BY created_at DESC');
        return rows;
    }

    // cari lot berdasarkan ID
    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM parking_lots WHERE id = ?', [id]);
        return rows[0];
    }

    // buat lot baru
    static async create(name, capacity) {
        const [result] = await db.execute(
            'INSERT INTO parking_lots (name, total_capacity) VALUES (?, ?)',
            [name, capacity]
        );
        return result.insertId;
    }

    // update lot berdasarkan ID
    static async update(id, name) {
        const [result] = await db.execute(
            'UPDATE parking_lots SET name = ? WHERE id = ?',
            [name, id]
        );
        return result.affectedRows;
    }

    // hapus lot berdasarkan ID
    static async delete(id) {
        const [result] = await db.execute('DELETE FROM parking_lots WHERE id = ?', [id]);
        return result.affectedRows;
    }
    
    // Ambil semua lot + hitung slot yang tersedia
    static async findAllWithStats() {
        const sql = `
            SELECT l.*, 
            (SELECT COUNT(*) FROM parking_spots s WHERE s.lot_id = l.id AND s.status = 'AVAILABLE') as available_slots
            FROM parking_lots l
            ORDER BY l.created_at DESC
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

}

module.exports = ParkingLot;
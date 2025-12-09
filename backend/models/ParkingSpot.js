const db = require('../config/database');

class ParkingSpot {
    // Bulk create spots (used when creating a new lot)
    static async createBulk(values) {
        if (values.length === 0) return;
        await db.query(
            'INSERT INTO parking_spots (lot_id, spot_number, status) VALUES ?',
            [values]
        );
    }

    // Ambil semua slot berdasarkan Lot ID
    static async findByLotId(lotId) {
        const [rows] = await db.execute(
            'SELECT * FROM parking_spots WHERE lot_id = ? ORDER BY id ASC',
            [lotId]
        );
        return rows;
    }
}

module.exports = ParkingSpot;
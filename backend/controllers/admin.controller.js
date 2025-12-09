const ParkingLot = require('../models/ParkingLot');
const ParkingSpot = require('../models/ParkingSpot');
const db = require('../config/database');

// Dapatkan semua tempat parkir
exports.getLots = async (req, res) => {
    try {
        const lots = await ParkingLot.findAll();
        res.json(lots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Buat tempat parkir baru
exports.createLot = async (req, res) => {
    try {
        // TERIMA DATA 'PREFIX' DARI FRONTEND
        const { name, capacity, prefix } = req.body;

        if (!name || !capacity) {
            return res.status(400).json({ message: 'Name and capacity are required' });
        }

        const lotId = await ParkingLot.create(name, capacity);

        const spotValues = [];
        
        // Jika Admin isi prefix, pakai itu. Jika tidak, pakai default L{ID}-
        let usedPrefix = `L${lotId}-`; // Default jika kosong

        if (prefix) {
            const cleanPrefix = prefix.trim();
            
            if (/[a-zA-Z0-9]$/.test(cleanPrefix)) {
                usedPrefix = cleanPrefix + '-';
            } else {
                usedPrefix = cleanPrefix;
            }
        }
        
        for (let i = 1; i <= capacity; i++) {
            spotValues.push([lotId, `${usedPrefix}${i}`, 'AVAILABLE']);
        }

        await ParkingSpot.createBulk(spotValues);

        res.status(201).json({
            message: 'Parking lot and slots created successfully',
            lotId
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update parking lot
exports.updateLot = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const affectedRows = await ParkingLot.update(id, name);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Parking lot not found' });
        }

        res.json({ message: 'Parking lot updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete parking lot
exports.deleteLot = async (req, res) => {
    try {
        const { id } = req.params;

        const affectedRows = await ParkingLot.delete(id);

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Parking lot not found' });
        }

        res.json({ message: 'Parking lot deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateSpotStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        let query = 'UPDATE parking_spots SET status = ? WHERE id = ?';
        let params = [status, id];

        if (status === 'AVAILABLE') {
            query = 'UPDATE parking_spots SET status = ?, user_id = NULL, booking_time = NULL WHERE id = ?';
        }

        else if (status === 'OCCUPIED') {
            query = 'UPDATE parking_spots SET status = ?, booking_time = NULL WHERE id = ?';
        }

        await db.execute(query, params);

        const [updatedSpot] = await db.execute('SELECT * FROM parking_spots WHERE id = ?', [id]);

        if (global.io) {
            global.io.emit('spotUpdate', updatedSpot[0]);
        }

        res.json({ message: `Slot updated to ${status}` });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getLots = async (req, res) => {
    try {
        const query = `
            SELECT 
                pl.id, pl.name, pl.total_capacity,
                (SELECT COUNT(*) FROM parking_spots WHERE lot_id = pl.id AND status = 'AVAILABLE') as available_count,
                (SELECT COUNT(*) FROM parking_spots WHERE lot_id = pl.id AND status = 'OCCUPIED') as occupied_count,
                (SELECT COUNT(*) FROM parking_spots WHERE lot_id = pl.id AND status = 'RESERVED') as reserved_count
            FROM parking_lots pl
        `;
        
        const [lots] = await db.execute(query);
        res.json(lots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
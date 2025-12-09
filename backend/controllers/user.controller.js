const ParkingLot = require('../models/ParkingLot');
const ParkingSpot = require('../models/ParkingSpot');

// Melihat Daftar Lot & Ketersediaan
exports.getLotsPublic = async (req, res) => {
    try {
        const lots = await ParkingLot.findAllWithStats();
        res.json(lots);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Melihat Detail Slot di satu Lot
exports.getLotDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Cek apakah lot ada
        const lot = await ParkingLot.findById(id);
        if (!lot) {
            return res.status(404).json({ message: 'Parking lot not found' });
        }

        // Ambil semua slot di lot tersebut
        const spots = await ParkingSpot.findByLotId(id);

        res.json({
            ...lot,  // Data Lot 
            spots    // Data Slot 
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
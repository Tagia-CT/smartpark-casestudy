const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/role');

// Terapkan middleware ke semua route di bawah ini
// Artinya: "Cek Token dulu, lalu Cek apakah dia Admin"
router.use(verifyToken, isAdmin);

// CRUD Parking Lots
router.get('/lots', adminController.getLots);       // Lihat semua lot
router.post('/lots', adminController.createLot);    // Tambah lot baru
router.put('/lots/:id', adminController.updateLot); // Edit nama lot
router.delete('/lots/:id', adminController.deleteLot); // Hapus lot
router.put('/spots/:id', adminController.updateSpotStatus); // Update status slot

module.exports = router;
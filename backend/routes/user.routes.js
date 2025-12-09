const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const bookingController = require('../controllers/booking.controller');
const verifyToken = require('../middleware/auth');

// Semua user yang login (Admin/User Biasa) boleh akses
router.use(verifyToken);

router.get('/', userController.getLotsPublic);      // List Parkiran
router.get('/:id', userController.getLotDetails);  // Detail Slot

router.post('/book', bookingController.bookSpot); 
router.post('/cancel', bookingController.cancelBooking);

module.exports = router;
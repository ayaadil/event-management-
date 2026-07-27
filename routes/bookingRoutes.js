const express = require('express');
const router = express.Router();
const Role = require('../constants/roles');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  getBookingById,
  verifyTicket,
  getBookingQRCode
} = require('../controllers/bookingController');
const { protect,authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.get('/', protect, authorize(Role.ADMIN), getAllBookings);
router.post('/verify',protect, verifyTicket);
router.get('/:id/qrcode', protect,getBookingQRCode);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;

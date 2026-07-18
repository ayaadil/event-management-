const express = require('express');
const router = express.Router();
const { createPayment, getPaymentByBooking } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createPayment);
router.get('/booking/:bookingId', protect, getPaymentByBooking);

module.exports = router;

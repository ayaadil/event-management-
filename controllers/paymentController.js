const PaymentModel = require('../models/paymentModel');
const BookingModel = require('../models/bookingModel');
const Role = require('../constants/roles');

// Stripe can lster be linked to a real payment gateway,such as registering a payment for a specific booking
const createPayment = async (req, res, next) => {
  try {
    const { booking_id, payment_method, transaction_ref } = req.body;

    const booking = await BookingModel.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }

    const paymentId = await PaymentModel.create({
      booking_id,
      amount: booking.total_price,
      payment_method,
      status: 'paid', 
      transaction_ref,
    });

    await BookingModel.updateStatus(booking_id, 'confirmed');

    res.status(201).json({ message: 'Payment processed successfully', paymentId });
  } catch (err) {
    next(err);
  }
};

const getPaymentByBooking = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.user_id !== req.user.id && req.user.role !== Role.ADMIN) {
      return res.status(403).json({ message: 'You are not allowed to perform this action' });
    }
    const payment = await PaymentModel.findByBookingId(req.params.bookingId);
    if (!payment) {
      return res.status(404).json({ message: 'No payment record found for this booking' });
    }
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

module.exports = { createPayment, getPaymentByBooking };

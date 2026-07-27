const db = require('../config/db');
const PAYMENT_STATUS = ['pending', 'paid', 'failed', 'refunded'];


const PaymentModel = {
  async create({ booking_id, amount, payment_method, status = 'pending', transaction_ref }) {
    if (!PAYMENT_STATUS.includes(status)) {
      const error = new Error('Invalid payment status');
      error.statusCode = 400;
      throw error;
    }
    const [result] = await db.query(
      `INSERT INTO payments (booking_id, amount, method, status, transaction_ref)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, amount, payment_method, status, transaction_ref]
    );
    return result.insertId;
  },

  async findByBookingId(booking_id) {
    const [rows] = await db.query(`SELECT * FROM payments WHERE booking_id = ?`, [booking_id]);
    return rows[0];
  },

  async updateStatus(id, status) {
    if (!PAYMENT_STATUS.includes(status)) {
      const error = new Error('Invalid payment status');
      error.statusCode = 400;
      throw error;
    }
    const paid_at = status === 'paid'? new Date() : null;
    await db.query(`UPDATE payments SET status = ?, paid_at =? WHERE id = ?`, [status,paid_at, id]);
    return true;
  },
};

module.exports = PaymentModel;

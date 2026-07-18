const db = require('../config/db');

const BookingModel = {
    /**
     * create a new booking (used inside a transaction connection)
     * @param {Object} connection - optional transaction connection; falls back to db
     */
  async create({ user_id,event_id, ticket_type_id, quantity, total_price, status = 'pending' },
    connection = db
  ) {
    const [result] = await connection.query(
      `INSERT INTO bookings (user_id, event_id, ticket_type_id, quantity, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, event_id, ticket_type_id, quantity, total_price, status]
    );
    return result.insertId;
  },

  async findByUserId(user_id) {
    const [rows] = await db.query(
      `SELECT b.*, tt.ticket_name, tt.price, e.title AS event_title
       FROM bookings b
       JOIN ticket_types tt ON b.ticket_type_id = tt.id
       JOIN events e ON tt.event_id = e.id
       WHERE b.user_id = ?
       ORDER BY b.booked_at DESC`,
      [user_id]
    );
    return rows;
  },

  async findAll() {
    const [rows] = await db.query(
      `SELECT b.*, tt.ticket_name, tt.price, e.title AS event_title, u.name AS user_name , u.email AS user_email
         FROM bookings b
         JOIN ticket_types tt ON b.ticket_type_id = tt.id
         JOIN events e ON tt.event_id = e.id
         JOIN users u ON b.user_id = u.id
         ORDER BY b.booked_at DESC`
    );
    return rows;
  },

  async findById(id, connection = db) {
    const [rows] = await connection.query(`SELECT * FROM bookings WHERE id = ?`, [id]);
    return rows[0];
  },

  async updateStatus(id, status, connection = db) {
    await connection.query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, id]);
    return true;
  },
   async markCheckedIn(id, connection = db) {
    const [result] = await connection.query(`UPDATE bookings SET checked_in_at = NOW() WHERE id = ? and checked_in_at is null`,
       [id]);
    return result.affectedRows > 0;
  }

};

module.exports = BookingModel;

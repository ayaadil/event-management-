const db = require('../config/db');
const { findById } = require('./categoryModel');

const TicketTypeModel = {
  async create({ event_id, ticket_name, price, capacity }) {
    const [result] = await db.query(
      `INSERT INTO ticket_types (event_id, ticket_name, price, capacity, available_tickets)
       VALUES (?, ?, ?, ?, ?)`,
      [event_id, ticket_name, price, capacity, capacity]
    );
    return result.insertId;
  },

  async findByEventId(event_id) {
    const [rows] = await db.query(
      `SELECT * FROM ticket_types WHERE event_id = ? AND deleted_at IS NULL`,
      [event_id]
    );
    return rows;
  },
  async findById(id,connection = db){
    const [rows] = await connection.query(
      `SELECT * FROM ticket_types WHERE id = ? AND deleted_at IS NULL`,
      [id]);
      return rows[0];
  },

  // تنقيص عدد التذاكر المتاحة عند الحجز (بشكل آمن ضد race condition)
  async decreaseAvailable(id, quantity, connection = db) {
    const [result] = await connection.query(
      `UPDATE ticket_types SET available_tickets = available_tickets - ?
       WHERE id = ? AND available_tickets >= ?`,
      [quantity, id, quantity]
    );
    return result.affectedRows > 0; // false يعني ما فيه تذاكر كافية
  },

  async increaseAvailable(id, quantity, connection = db) {
    await connection.query(
      `UPDATE ticket_types SET available_tickets = available_tickets + ? WHERE id = ?`,
      [quantity, id]
    );
    return true;
  },
  
  async update(id, fields) {
    const keys = Object.keys(fields);
    if (keys.length === 0) return false;
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    await db.query(`UPDATE ticket_types SET ${setClause} WHERE id = ?`, [...values, id]);
    return true;
  },
//
  async delete(id) {
    await db.query(`UPDATE ticket_types SET deleted_at = NOW() WHERE id = ?`, [id]);
    return true;
  },
};

module.exports = TicketTypeModel;

const db = require('../config/db');

const SavedEventModel = {
  async add(user_id, event_id) {
    await db.query(
      `INSERT IGNORE INTO saved_events (user_id, event_id) VALUES (?, ?)`,
      [user_id, event_id]
    );
    return true;
  },

  async remove(user_id, event_id) {
    await db.query(
      `DELETE FROM saved_events WHERE user_id = ? AND event_id = ?`,
      [user_id, event_id]
    );
    return true;
  },

  async findByUserId(user_id) {
    const [rows] = await db.query(
      `SELECT e.* FROM saved_events se
       JOIN events e ON se.event_id = e.id
       WHERE se.user_id = ?`,
      [user_id]
    );
    return rows;
  },
};

module.exports = SavedEventModel;

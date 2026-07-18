const db = require('../config/db');

const SpeakerModel = {
  async create({ name, role, company, image_url }) {
    const [result] = await db.query(
      `INSERT INTO speakers (name, role, company, image_url) VALUES (?, ?, ?, ?)`,
      [name, role, company, image_url]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await db.query(`SELECT * FROM speakers`);
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM speakers WHERE id = ?`, [id]);
    return rows[0];
  },

  async findByEventId(event_id) {
    const [rows] = await db.query(
      `SELECT s.* FROM event_speakers es
       JOIN speakers s ON es.speaker_id = s.id
       WHERE es.event_id = ?`,
      [event_id]
    );
    return rows;
  },

  async linkToEvent(event_id, speaker_id) {
    await db.query(
      `INSERT IGNORE INTO event_speakers (event_id, speaker_id) VALUES (?, ?)`,
      [event_id, speaker_id]
    );
    return true;
  },
};

module.exports = SpeakerModel;

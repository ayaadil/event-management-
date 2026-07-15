const pool = require('../config/db');

const Event = {
  async create({
    title,
    description,
    image_url,
    date_time,
    location,
    latitude,
    longitude,
    organizer_id,
    category_id,
    status,
  }) {
    const [result] = await pool.query(
      `INSERT INTO events
        (title, description, image_url, date_time, location, latitude, longitude, organizer_id, category_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        image_url || null,
        date_time,
        location || null,
        latitude || null,
        longitude || null,
        organizer_id,
        category_id || null,
        status || 'draft',
      ]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT e.*, c.name AS category_name, u.name AS organizer_name, u.email AS organizer_email
       FROM events e
       LEFT JOIN categories c ON c.id = e.category_id
       LEFT JOIN users u ON u.id = e.organizer_id
       WHERE e.id = ? AND e.deleted_at IS NULL`,
      [id]
    );
    return rows[0] || null;
  },

  async findAll({ category, location, status, from, to, search, limit = 10, offset = 0 }) {
    const conditions = ['e.deleted_at IS NULL'];
    const params = [];

    if (category) {
      conditions.push('e.category_id = ?');
      params.push(category);
    }
    if (location) {
      conditions.push('e.location LIKE ?');
      params.push(`%${location}%`);
    }
    if (status) {
      conditions.push('e.status = ?');
      params.push(status);
    }
    if (from) {
      conditions.push('e.date_time >= ?');
      params.push(from);
    }
    if (to) {
      conditions.push('e.date_time <= ?');
      params.push(to);
    }
    if (search) {
      conditions.push('(e.title LIKE ? OR e.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [rows] = await pool.query(
      `SELECT e.*, c.name AS category_name, u.name AS organizer_name
       FROM events e
       LEFT JOIN categories c ON c.id = e.category_id
       LEFT JOIN users u ON u.id = e.organizer_id
       ${whereClause}
       ORDER BY e.date_time ASC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM events e ${whereClause}`,
      params
    );

    return { rows, total: countRows[0].total };
  },

  async update(id, fields) {
    const allowed = [
      'title',
      'description',
      'image_url',
      'date_time',
      'location',
      'latitude',
      'longitude',
      'category_id',
      'status',
    ];
    const updates = [];
    const params = [];

    for (const key of Object.keys(fields)) {
      if (allowed.includes(key) && fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    await pool.query(
      `UPDATE events SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
      params
    );
    return this.findById(id);
  },

  async remove(id) {
    const [result] = await pool.query(
      'UPDATE events SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Event;
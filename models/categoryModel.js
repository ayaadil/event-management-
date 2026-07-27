const pool = require('../config/db');

const Category = {
  async create({ name, icon_url }) {
    const [result] = await pool.query(
      'INSERT INTO categories (name, icon_url) VALUES (?, ?)',
      [name, icon_url ?? null]
    );
    return { id: result.insertId, name, icon_url: icon_url ?? null };
  },

  async findByName(name) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE name = ?', [name]);
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async update(id, { name, icon_url }) {
    const existing = await this.findById(id);
    if (!existing) return null;

    await pool.query('UPDATE categories SET name = ?, icon_url = ? WHERE id = ?', [
      name ?? existing.name,
      icon_url ?? existing.icon_url,
      id,
    ]);
    return this.findById(id);
  },
//
  async remove(id) {
    const [events] = await pool.query('SELECT id FROM events WHERE category_id = ?', [id]);
    if (events.length > 0) {
      const error = new Error('Cannot delete category: it has associated events');
      error.statusCode = 409;
      throw error;
    }
    const [deleteResult] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    return deleteResult.affectedRows > 0;
  },
};

module.exports = Category;
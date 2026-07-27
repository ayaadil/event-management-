const db = require('../config/db');
const Role = require('../constants/roles');

const UserModel = {
    async create({ name, email, password, role = Role.USER }) {
        const [result] = await db.query(
            `INSERT INTO users(name,email, password, role) VALUES(?,?,?,?)`,
            [name,email,password,role]
        );
        return result.insertId;
    },

    async findByEmail(email){
        const [rows] = await db.query(
            `SELECT * FROM users WHERE email = ? and deleted_at IS NULL`,
            [email]
        );
        return rows[0];

    },
    async findAll(){
        const [rows] = await db.query(
            `SELECT id, name, email, role, created_at FROM users WHERE deleted_at IS NULL
             ORDER BY created_at DESC`
        );
        return rows;
    },
     
    async findById(id) {
    const [rows] = await db.query(
      `SELECT id, name, email, role, created_at FROM users WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return rows[0];
  },

   async update(id, fields) {
    const allowed = ['name', 'email', 'password', 'role'];
    const keys = Object.keys(fields).filter((k) => allowed.includes(k) && fields[k] !== undefined);
    if (keys.length === 0) return false;
    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    const values = keys.map((k) => fields[k]);
    await db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    return true;
  },


  async softDelete(id) {
    await db.query(`UPDATE users SET deleted_at = NOW() WHERE id = ?`, [id]);
    return true;
  },
};

module.exports = UserModel;
const pool = require('../config/db')

const addressModel = {
  async findByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [userId]
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM addresses WHERE id = ?', [id])
    return rows[0] || null
  },

  async create(userId, data) {
    const { receiver_name, phone, province, city, district, detail, is_default } = data
    if (is_default) {
      await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId])
    }
    const [result] = await pool.execute(
      `INSERT INTO addresses (user_id, receiver_name, phone, province, city, district, detail, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, receiver_name, phone, province, city, district, detail, is_default ? 1 : 0]
    )
    return result.insertId
  },

  async update(id, userId, data) {
    if (data.is_default) {
      await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId])
    }
    const keys = Object.keys(data)
    const setClause = keys.map(k => `${k} = ?`).join(', ')
    const values = keys.map(k => data[k])
    await pool.execute(
      `UPDATE addresses SET ${setClause} WHERE id = ? AND user_id = ?`,
      [...values, id, userId]
    )
  },

  async delete(id, userId) {
    await pool.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId])
  }
}

module.exports = addressModel

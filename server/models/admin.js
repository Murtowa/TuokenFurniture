const pool = require('../config/db')

const adminModel = {
  async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM admin_users WHERE username = ?', [username]
    )
    return rows[0] || null
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, nickname, role, created_at FROM admin_users WHERE id = ?', [id]
    )
    return rows[0] || null
  }
}

module.exports = adminModel

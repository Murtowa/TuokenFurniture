const pool = require('../config/db')

const userModel = {
  async create({ username, password, nickname, phone }) {
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, nickname, phone) VALUES (?, ?, ?, ?)',
      [username, password, nickname, phone]
    )
    return result.insertId
  },

  async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?', [username]
    )
    return rows[0] || null
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, nickname, phone, avatar, status, created_at FROM users WHERE id = ?', [id]
    )
    return rows[0] || null
  },

  async update(id, fields) {
    const keys = Object.keys(fields)
    const setClause = keys.map(k => `${k} = ?`).join(', ')
    const values = keys.map(k => fields[k])
    await pool.execute(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id])
  },

  async findAll({ page = 1, pageSize = 20, keyword = '' }) {
    let where = ''
    const params = []
    if (keyword) {
      where = 'WHERE username LIKE ? OR nickname LIKE ?'
      params.push(`%${keyword}%`, `%${keyword}%`)
    }
    const offset = (page - 1) * pageSize
    const [rows] = await pool.execute(
      `SELECT id, username, nickname, phone, avatar, status, created_at FROM users ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...params, String(pageSize), String(offset)]
    )
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM users ${where}`, params
    )
    return { list: rows, total: countResult[0].total }
  },

  async updateStatus(id, status) {
    await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id])
  }
}

module.exports = userModel

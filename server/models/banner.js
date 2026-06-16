const pool = require('../config/db')

const bannerModel = {
  async findActive() {
    const [rows] = await pool.execute(
      'SELECT * FROM banners WHERE status = 1 ORDER BY sort_order ASC'
    )
    return rows
  },

  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM banners ORDER BY sort_order ASC'
    )
    return rows
  },

  async create({ image, link, sort_order }) {
    const [result] = await pool.execute(
      'INSERT INTO banners (image, link, sort_order) VALUES (?, ?, ?)',
      [image, link || '', sort_order || 0]
    )
    return result.insertId
  },

  async update(id, fields) {
    const keys = Object.keys(fields)
    const setClause = keys.map(k => `${k} = ?`).join(', ')
    const values = keys.map(k => fields[k])
    await pool.execute(`UPDATE banners SET ${setClause} WHERE id = ?`, [...values, id])
  },

  async delete(id) {
    await pool.execute('DELETE FROM banners WHERE id = ?', [id])
  }
}

module.exports = bannerModel

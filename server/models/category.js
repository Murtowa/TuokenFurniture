const pool = require('../config/db')

const categoryModel = {
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
    )
    return rows
  },

  async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id])
    return rows[0] || null
  },

  async create({ name, parent_id, sort_order, icon }) {
    const [result] = await pool.execute(
      'INSERT INTO categories (name, parent_id, sort_order, icon) VALUES (?, ?, ?, ?)',
      [name, parent_id || null, sort_order || 0, icon || '']
    )
    return result.insertId
  },

  async update(id, fields) {
    const keys = Object.keys(fields)
    const setClause = keys.map(k => `${k} = ?`).join(', ')
    const values = keys.map(k => fields[k])
    await pool.execute(`UPDATE categories SET ${setClause} WHERE id = ?`, [...values, id])
  },

  async delete(id) {
    await pool.execute('DELETE FROM categories WHERE id = ?', [id])
  },

  async getTree() {
    const all = await this.findAll()
    const map = {}
    const tree = []
    all.forEach(item => {
      map[item.id] = { ...item, children: [] }
    })
    all.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id])
      } else {
        tree.push(map[item.id])
      }
    })
    return tree
  }
}

module.exports = categoryModel

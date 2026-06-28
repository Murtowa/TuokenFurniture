const pool = require('../config/db')

const categoryModel = {
  async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY sort_order ASC, id ASC'
    )
    return rows
  },

  async findByName(name) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE LOWER(name) = LOWER(?)', [name]
    )
    return rows[0] || null
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

  async batchDelete(ids) {
    if (!ids || ids.length === 0) return { deleted: 0, blocked: [] }

    // 检查子分类
    const idPlaceholders = ids.map(() => '?').join(',')
    const [children] = await pool.execute(
      `SELECT parent_id, GROUP_CONCAT(name) as names FROM categories WHERE parent_id IN (${idPlaceholders}) GROUP BY parent_id`,
      ids
    )
    const blockedByChildren = new Map()
    children.forEach(row => {
      blockedByChildren.set(row.parent_id, `存在子分类: ${row.names}`)
    })

    // 检查关联商品
    const [products] = await pool.execute(
      `SELECT category_id, COUNT(*) as cnt FROM products WHERE category_id IN (${idPlaceholders}) GROUP BY category_id`,
      ids
    )
    const blockedByProducts = new Map()
    products.forEach(row => {
      blockedByProducts.set(row.category_id, `存在 ${row.cnt} 个关联商品`)
    })

    const toDelete = []
    const blocked = []
    for (const id of ids) {
      const reason = blockedByChildren.get(id) || blockedByProducts.get(id)
      if (reason) {
        // 获取分类名称
        const [catRows] = await pool.execute('SELECT name FROM categories WHERE id = ?', [id])
        blocked.push({ id, name: catRows[0]?.name || String(id), reason })
      } else {
        toDelete.push(id)
      }
    }

    if (toDelete.length > 0) {
      const delPlaceholders = toDelete.map(() => '?').join(',')
      await pool.execute(`DELETE FROM categories WHERE id IN (${delPlaceholders})`, toDelete)
    }

    return { deleted: toDelete.length, blocked }
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

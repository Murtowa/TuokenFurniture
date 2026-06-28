const pool = require('../config/db')

const productModel = {
  async findAll({ page = 1, pageSize = 12, categoryId, keyword, sort = 'default' }) {
    let where = 'WHERE p.status = 1'
    const params = []

    if (categoryId) {
      where += ' AND (c.id = ? OR c.parent_id = ?)'
      params.push(categoryId, categoryId)
    }
    if (keyword) {
      where += ' AND p.name LIKE ?'
      params.push(`%${keyword}%`)
    }

    let orderBy = 'ORDER BY p.id DESC'
    if (sort === 'price_asc') orderBy = 'ORDER BY p.price ASC'
    else if (sort === 'price_desc') orderBy = 'ORDER BY p.price DESC'
    else if (sort === 'newest') orderBy = 'ORDER BY p.created_at DESC'

    const offset = (page - 1) * pageSize

    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where} ${orderBy} LIMIT ? OFFSET ?`,
      [...params, String(pageSize), String(offset)]
    )
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    )
    return { list: rows, total: countResult[0].total }
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`, [id]
    )
    return rows[0] || null
  },

  async create(data) {
    const { category_id, name, description, price, stock, main_image, images } = data
    const [result] = await pool.execute(
      `INSERT INTO products (category_id, name, description, price, stock, main_image, images)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_id || null, name, description, price, stock || 0, main_image || '', JSON.stringify(images || [])]
    )
    return result.insertId
  },

  async update(id, data) {
    const fields = { ...data }
    if (fields.images) fields.images = JSON.stringify(fields.images)
    const keys = Object.keys(fields)
    const setClause = keys.map(k => `${k} = ?`).join(', ')
    const values = keys.map(k => fields[k])
    await pool.execute(`UPDATE products SET ${setClause} WHERE id = ?`, [...values, id])
  },

  async delete(id) {
    await pool.execute('DELETE FROM products WHERE id = ?', [id])
  },

  async batchUpdateStatus(ids, status) {
    if (!ids || ids.length === 0) return { affected: 0, skipped: 0, total: 0 }
    const placeholders = ids.map(() => '?').join(',')
    const [result] = await pool.execute(
      `UPDATE products SET status = ? WHERE id IN (${placeholders}) AND status != ?`,
      [status, ...ids, status]
    )
    return { affected: result.affectedRows, skipped: ids.length - result.affectedRows, total: ids.length }
  },

  async batchUpdateCategory(ids, categoryId) {
    if (!ids || ids.length === 0) return { affected: 0, total: 0 }
    const placeholders = ids.map(() => '?').join(',')
    const [result] = await pool.execute(
      `UPDATE products SET category_id = ? WHERE id IN (${placeholders})`,
      [categoryId, ...ids]
    )
    return { affected: result.affectedRows, total: ids.length }
  },

  async batchDelete(ids) {
    if (!ids || ids.length === 0) return { affected: 0, total: 0 }
    const placeholders = ids.map(() => '?').join(',')
    const [result] = await pool.execute(
      `DELETE FROM products WHERE id IN (${placeholders})`,
      ids
    )
    return { affected: result.affectedRows, total: ids.length }
  },

  async adminFindAll({ page = 1, pageSize = 20, keyword, categoryId, status }) {
    let where = 'WHERE 1=1'
    const params = []

    if (keyword) {
      where += ' AND p.name LIKE ?'
      params.push(`%${keyword}%`)
    }
    if (categoryId) {
      where += ' AND p.category_id = ?'
      params.push(categoryId)
    }
    if (status !== undefined && status !== '') {
      where += ' AND p.status = ?'
      params.push(status)
    }

    const offset = (page - 1) * pageSize
    const [rows] = await pool.execute(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where} ORDER BY p.id DESC LIMIT ? OFFSET ?`,
      [...params, String(pageSize), String(offset)]
    )
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM products p ${where}`, params
    )
    return { list: rows, total: countResult[0].total }
  }
}

module.exports = productModel

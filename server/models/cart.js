const pool = require('../config/db')

const cartModel = {
  async findByUser(userId) {
    const [rows] = await pool.execute(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.main_image, p.stock, p.status
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`, [userId]
    )
    return rows
  },

  async addItem(userId, productId, quantity) {
    const [existing] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    )
    if (existing.length > 0) {
      await pool.execute(
        'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
        [quantity, existing[0].id]
      )
    } else {
      await pool.execute(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity]
      )
    }
  },

  async updateQuantity(id, quantity) {
    await pool.execute('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, id])
  },

  async removeItem(id) {
    await pool.execute('DELETE FROM cart_items WHERE id = ?', [id])
  },

  async clearByUser(userId) {
    await pool.execute('DELETE FROM cart_items WHERE user_id = ?', [userId])
  },

  async mergeLocalItems(userId, items) {
    for (const item of items) {
      await this.addItem(userId, item.productId, item.quantity)
    }
  }
}

module.exports = cartModel

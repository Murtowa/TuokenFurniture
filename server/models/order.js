const pool = require('../config/db')

const orderModel = {
  async generateOrderNo() {
    const now = new Date()
    const date = now.toISOString().slice(0, 10).replace(/-/g, '')
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM orders WHERE order_no LIKE ?",
      [`TK${date}%`]
    )
    const seq = String(rows[0].count + 1).padStart(4, '0')
    return `TK${date}${seq}`
  },

  async create({ userId, addressSnapshot, totalAmount, items, remark }) {
    const orderNo = await this.generateOrderNo()
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      const [orderResult] = await conn.execute(
        `INSERT INTO orders (order_no, user_id, address_snapshot, total_amount, remark)
         VALUES (?, ?, ?, ?, ?)`,
        [orderNo, userId, JSON.stringify(addressSnapshot), totalAmount, remark || '']
      )
      const orderId = orderResult.insertId

      for (const item of items) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, product_snapshot, quantity, price)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.productId, JSON.stringify(item.snapshot), item.quantity, item.price]
        )
        await conn.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [item.quantity, item.productId, item.quantity]
        )
      }

      await conn.execute('DELETE FROM cart_items WHERE user_id = ?', [userId])
      await conn.commit()
      return { orderId, orderNo }
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  },

  async findByUser(userId, { page = 1, pageSize = 10 }) {
    const offset = (page - 1) * pageSize
    const [rows] = await pool.execute(
      `SELECT id, order_no, total_amount, status, created_at
       FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
      [userId, String(pageSize), String(offset)]
    )
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]
    )
    return { list: rows, total: countResult[0].total }
  },

  async findById(orderId, userId) {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?', [orderId]
    )
    if (orders.length === 0) return null
    const order = orders[0]

    if (userId && order.user_id !== userId) return null

    const [items] = await pool.execute(
      'SELECT * FROM order_items WHERE order_id = ?', [orderId]
    )
    order.items = items
    return order
  },

  async cancel(orderId, userId) {
    const order = await this.findById(orderId, userId)
    if (!order) throw Object.assign(new Error('订单不存在'), { status: 404 })
    if (order.status !== 'pending') {
      throw Object.assign(new Error('仅可取消待支付订单'), { status: 400 })
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      await conn.execute(
        "UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId]
      )
      const [items] = await conn.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]
      )
      for (const item of items) {
        await conn.execute(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.product_id]
        )
      }
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  },

  async adminFindAll({ page = 1, pageSize = 20, status, orderNo }) {
    let where = 'WHERE 1=1'
    const params = []
    if (status) {
      where += ' AND o.status = ?'
      params.push(status)
    }
    if (orderNo) {
      where += ' AND o.order_no LIKE ?'
      params.push(`%${orderNo}%`)
    }
    const offset = (page - 1) * pageSize
    const [rows] = await pool.execute(
      `SELECT o.*, u.username, u.nickname
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ${where} ORDER BY o.id DESC LIMIT ? OFFSET ?`,
      [...params, String(pageSize), String(offset)]
    )
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM orders o ${where}`, params
    )
    return { list: rows, total: countResult[0].total }
  },

  async adminUpdateStatus(orderId, status) {
    const validStatuses = ['paid', 'shipped', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw Object.assign(new Error('无效的状态'), { status: 400 })
    }

    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      const updateFields = { status }
      if (status === 'paid') updateFields.paid_at = new Date()
      if (status === 'shipped') updateFields.shipped_at = new Date()

      const keys = Object.keys(updateFields)
      const setClause = keys.map(k => `${k} = ?`).join(', ')
      const values = keys.map(k => updateFields[k])

      const [result] = await conn.execute(
        `UPDATE orders SET ${setClause} WHERE id = ?`, [...values, orderId]
      )
      if (result.affectedRows === 0) {
        throw Object.assign(new Error('订单不存在'), { status: 404 })
      }

      if (status === 'cancelled') {
        const [items] = await conn.execute(
          'SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]
        )
        for (const item of items) {
          await conn.execute(
            'UPDATE products SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.product_id]
          )
        }
      }

      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  },

  async getDashboardStats() {
    const [[productCount]] = await pool.execute('SELECT COUNT(*) as count FROM products WHERE status = 1')
    const [[userCount]] = await pool.execute('SELECT COUNT(*) as count FROM users')
    const [[monthOrders]] = await pool.execute(
      "SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE status != 'cancelled' AND MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE())"
    )
    return {
      products: productCount.count,
      orders: monthOrders.count,
      revenue: monthOrders.revenue,
      users: userCount.count
    }
  },

  async getOrderTrend() {
    const [rows] = await pool.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount
       FROM orders WHERE status != 'cancelled' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(created_at) ORDER BY date ASC`
    )
    return rows
  },

  async getCategoryDistribution() {
    const [rows] = await pool.execute(
      `SELECT c.name, COUNT(oi.id) as count
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       GROUP BY c.id, c.name ORDER BY count DESC LIMIT 10`
    )
    return rows
  },

  async getRecentOrders(limit = 10) {
    const [rows] = await pool.execute(
      `SELECT o.order_no, u.username, o.total_amount as amount, o.status, o.created_at as createdAt
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.id DESC LIMIT ?`, [String(limit)]
    )
    return rows
  }
}

module.exports = orderModel

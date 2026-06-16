const router = require('express').Router()
const { auth, adminAuth } = require('../../middleware/auth')
const { ok } = require('../../utils/response')
const orderModel = require('../../models/order')

router.use(auth, adminAuth)

router.get('/dashboard', async (req, res, next) => {
  try {
    const [counts, orderTrend, categoryDistribution, recentOrders] = await Promise.all([
      orderModel.getDashboardStats(),
      orderModel.getOrderTrend(),
      orderModel.getCategoryDistribution(),
      orderModel.getRecentOrders(10)
    ])
    res.json(ok({ counts, orderTrend, categoryDistribution, recentOrders }))
  } catch (err) { next(err) }
})

module.exports = router

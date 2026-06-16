const router = require('express').Router()
const { auth, adminAuth } = require('../../middleware/auth')
const { ok, fail } = require('../../utils/response')
const orderModel = require('../../models/order')

router.use(auth, adminAuth)

router.get('/orders', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, orderNo } = req.query
    const result = await orderModel.adminFindAll({
      page: parseInt(page), pageSize: parseInt(pageSize), status, orderNo
    })
    res.json(ok(result))
  } catch (err) { next(err) }
})

router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await orderModel.findById(req.params.id, null)
    if (!order) return res.status(404).json(fail('订单不存在', 404))
    res.json(ok(order))
  } catch (err) { next(err) }
})

router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json(fail('状态不能为空'))
    await orderModel.adminUpdateStatus(req.params.id, status)
    res.json(ok(null, '状态更新成功'))
  } catch (err) { next(err) }
})

module.exports = router

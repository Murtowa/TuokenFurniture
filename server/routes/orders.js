const router = require('express').Router()
const { auth } = require('../middleware/auth')
const pool = require('../config/db')
const { ok, fail } = require('../utils/response')
const orderModel = require('../models/order')
const productModel = require('../models/product')

router.use(auth)

router.post('/', async (req, res, next) => {
  try {
    const { addressId, items, remark } = req.body
    if (!addressId || !items || items.length === 0) {
      return res.status(400).json(fail('地址和商品不能为空'))
    }

    const addressModel = require('../models/address')
    const address = await addressModel.findById(addressId)
    if (!address || address.user_id !== req.user.userId) {
      return res.status(400).json(fail('地址不存在'))
    }

    let totalAmount = 0
    const orderItems = []
    for (const item of items) {
      const product = await productModel.findById(item.productId)
      if (!product || product.status === 0) {
        return res.status(400).json(fail(`商品 ${item.productId} 不存在或已下架`))
      }
      if (product.stock < item.quantity) {
        return res.status(400).json(fail(`${product.name} 库存不足`))
      }
      totalAmount += product.price * item.quantity
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        snapshot: { name: product.name, price: product.price, main_image: product.main_image }
      })
    }

    const { orderId, orderNo } = await orderModel.create({
      userId: req.user.userId,
      addressSnapshot: {
        receiver_name: address.receiver_name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail
      },
      totalAmount,
      items: orderItems,
      remark
    })

    res.json(ok({ orderId, orderNo }, '下单成功'))
  } catch (err) { next(err) }
})

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10 } = req.query
    const result = await orderModel.findByUser(req.user.userId, {
      page: parseInt(page), pageSize: parseInt(pageSize)
    })
    res.json(ok(result))
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderModel.findById(req.params.id, req.user.userId)
    if (!order) return res.status(404).json(fail('订单不存在', 404))
    res.json(ok(order))
  } catch (err) { next(err) }
})

router.put('/:id/cancel', async (req, res, next) => {
  try {
    await orderModel.cancel(req.params.id, req.user.userId)
    res.json(ok(null, '订单已取消'))
  } catch (err) { next(err) }
})

router.put('/:id/complete', async (req, res, next) => {
  try {
    await orderModel.confirmReceipt(req.params.id, req.user.userId)
    res.json(ok(null, '已确认收货'))
  } catch (err) { next(err) }
})

router.put('/:id/pay', async (req, res, next) => {
  try {
    const order = await orderModel.findById(req.params.id, req.user.userId)
    if (!order) return res.status(404).json(fail('订单不存在', 404))
    if (order.status !== 'pending') {
      return res.status(400).json(fail('订单状态不允许支付'))
    }

    await pool.execute("UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = ?", [req.params.id])
    res.json(ok(null, '支付成功'))
  } catch (err) { next(err) }
})

module.exports = router
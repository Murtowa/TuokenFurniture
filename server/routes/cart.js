const router = require('express').Router()
const { auth } = require('../middleware/auth')
const { ok, fail } = require('../utils/response')
const cartModel = require('../models/cart')

router.use(auth)

router.get('/', async (req, res, next) => {
  try {
    const items = await cartModel.findByUser(req.user.userId)
    res.json(ok(items))
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body
    if (!productId) return res.status(400).json(fail('商品ID不能为空'))
    await cartModel.addItem(req.user.userId, parseInt(productId), parseInt(quantity))
    const items = await cartModel.findByUser(req.user.userId)
    res.json(ok(items, '添加成功'))
  } catch (err) { next(err) }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { quantity } = req.body
    if (!quantity || quantity < 1) return res.status(400).json(fail('数量至少为1'))
    await cartModel.updateQuantity(parseInt(req.params.id), parseInt(quantity))
    const items = await cartModel.findByUser(req.user.userId)
    res.json(ok(items, '更新成功'))
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await cartModel.removeItem(parseInt(req.params.id))
    const items = await cartModel.findByUser(req.user.userId)
    res.json(ok(items, '删除成功'))
  } catch (err) { next(err) }
})

module.exports = router

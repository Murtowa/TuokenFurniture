const router = require('express').Router()
const { ok } = require('../utils/response')
const productModel = require('../models/product')

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 12, categoryId, keyword, sort } = req.query
    const result = await productModel.findAll({
      page: parseInt(page), pageSize: parseInt(pageSize),
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      keyword, sort
    })
    res.json(ok(result))
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const product = await productModel.findById(req.params.id)
    if (!product) return res.status(404).json(require('../utils/response').fail('商品不存在', 404))
    res.json(ok(product))
  } catch (err) { next(err) }
})

module.exports = router

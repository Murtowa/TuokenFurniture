const router = require('express').Router()
const { auth, adminAuth } = require('../../middleware/auth')
const { ok, fail } = require('../../utils/response')
const productModel = require('../../models/product')

router.use(auth, adminAuth)

router.get('/products', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword, categoryId, status } = req.query
    const result = await productModel.adminFindAll({
      page: parseInt(page), pageSize: parseInt(pageSize),
      keyword, categoryId: categoryId ? parseInt(categoryId) : undefined, status
    })
    res.json(ok(result))
  } catch (err) { next(err) }
})

router.post('/products', async (req, res, next) => {
  try {
    const { name, price } = req.body
    if (!name || !price) return res.status(400).json(fail('名称和价格不能为空'))
    const id = await productModel.create(req.body)
    res.json(ok({ id }, '创建成功'))
  } catch (err) { next(err) }
})

router.put('/products/:id', async (req, res, next) => {
  try {
    await productModel.update(req.params.id, req.body)
    res.json(ok(null, '更新成功'))
  } catch (err) { next(err) }
})

router.delete('/products/:id', async (req, res, next) => {
  try {
    await productModel.delete(req.params.id)
    res.json(ok(null, '删除成功'))
  } catch (err) { next(err) }
})

module.exports = router

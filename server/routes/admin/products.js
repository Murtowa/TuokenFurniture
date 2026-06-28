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

// 批量路由
router.put('/products/batch-status', async (req, res, next) => {
  try {
    const { ids, status } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(fail('请选择至少一个商品'))
    }
    if (![0, 1].includes(status)) {
      return res.status(400).json(fail('状态值无效'))
    }
    const result = await productModel.batchUpdateStatus(ids, status)
    const action = status === 1 ? '上架' : '下架'
    const msg = result.skipped > 0
      ? `已${action} ${result.affected} 个商品，${result.skipped} 个商品无需变更`
      : `已${action} ${result.affected} 个商品`
    res.json(ok(result, msg))
  } catch (err) { next(err) }
})

router.put('/products/batch-category', async (req, res, next) => {
  try {
    const { ids, categoryId } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(fail('请选择至少一个商品'))
    }
    if (!categoryId) {
      return res.status(400).json(fail('请选择目标分类'))
    }
    const result = await productModel.batchUpdateCategory(ids, categoryId)
    res.json(ok(result, `已将 ${result.affected} 个商品移动到目标分类`))
  } catch (err) { next(err) }
})

router.post('/products/batch-delete', async (req, res, next) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(fail('请选择至少一个商品'))
    }
    const result = await productModel.batchDelete(ids)
    res.json(ok(result, `已删除 ${result.affected} 个商品`))
  } catch (err) { next(err) }
})

module.exports = router

const router = require('express').Router()
const { auth, adminAuth } = require('../../middleware/auth')
const { ok, fail } = require('../../utils/response')
const categoryModel = require('../../models/category')

router.use(auth, adminAuth)

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await categoryModel.findAll()
    res.json(ok(categories))
  } catch (err) { next(err) }
})

router.post('/categories', async (req, res, next) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json(fail('分类名称不能为空'))
    const id = await categoryModel.create(req.body)
    res.json(ok({ id }, '创建成功'))
  } catch (err) { next(err) }
})

router.put('/categories/:id', async (req, res, next) => {
  try {
    await categoryModel.update(req.params.id, req.body)
    res.json(ok(null, '更新成功'))
  } catch (err) { next(err) }
})

router.delete('/categories/:id', async (req, res, next) => {
  try {
    await categoryModel.delete(req.params.id)
    res.json(ok(null, '删除成功'))
  } catch (err) { next(err) }
})

module.exports = router

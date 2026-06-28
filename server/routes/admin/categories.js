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
    const existing = await categoryModel.findByName(name)
    if (existing) return res.status(400).json(fail('分类名称已存在'))
    const id = await categoryModel.create(req.body)
    res.json(ok({ id }, '创建成功'))
  } catch (err) { next(err) }
})

router.put('/categories/:id', async (req, res, next) => {
  try {
    if (req.body.name) {
      const existing = await categoryModel.findByName(req.body.name)
      if (existing && existing.id !== parseInt(req.params.id)) {
        return res.status(400).json(fail('分类名称已存在'))
      }
    }
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

router.post('/categories/batch-delete', async (req, res, next) => {
  try {
    const { ids } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(fail('请选择至少一个分类'))
    }
    const result = await categoryModel.batchDelete(ids)
    if (result.blocked.length > 0) {
      const blockedInfo = result.blocked.map(b => `「${b.name}」${b.reason}`).join('；')
      if (result.deleted === 0) {
        return res.status(400).json(fail(`无法删除：${blockedInfo}`))
      }
      return res.json(ok(result, `已删除 ${result.deleted} 个分类。以下分类被跳过：${blockedInfo}`))
    }
    res.json(ok(result, `已删除 ${result.deleted} 个分类`))
  } catch (err) { next(err) }
})

module.exports = router

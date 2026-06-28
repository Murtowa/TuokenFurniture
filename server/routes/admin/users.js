const router = require('express').Router()
const { auth, adminAuth } = require('../../middleware/auth')
const { ok, fail } = require('../../utils/response')
const userModel = require('../../models/user')

router.use(auth, adminAuth)

router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, keyword } = req.query
    const result = await userModel.findAll({
      page: parseInt(page), pageSize: parseInt(pageSize), keyword
    })
    res.json(ok(result))
  } catch (err) { next(err) }
})

// 批量路由必须在 /:id/status 之前注册
router.put('/users/batch-status', async (req, res, next) => {
  try {
    const { ids, status } = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json(fail('请选择至少一个用户'))
    }
    if (![0, 1].includes(status)) {
      return res.status(400).json(fail('状态值无效'))
    }
    const result = await userModel.batchUpdateStatus(ids, status)
    const action = status === 1 ? '启用' : '禁用'
    const msg = result.skipped > 0
      ? `已${action} ${result.affected} 个用户，${result.skipped} 个用户无需变更`
      : `已${action} ${result.affected} 个用户`
    res.json(ok(result, msg))
  } catch (err) { next(err) }
})

router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body
    await userModel.updateStatus(req.params.id, status)
    res.json(ok(null, '状态更新成功'))
  } catch (err) { next(err) }
})

module.exports = router

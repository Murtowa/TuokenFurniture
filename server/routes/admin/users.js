const router = require('express').Router()
const { auth, adminAuth } = require('../../middleware/auth')
const { ok } = require('../../utils/response')
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

router.put('/users/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body
    await userModel.updateStatus(req.params.id, status)
    res.json(ok(null, '状态更新成功'))
  } catch (err) { next(err) }
})

module.exports = router

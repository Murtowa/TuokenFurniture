const router = require('express').Router()
const { auth } = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const { ok, fail } = require('../utils/response')
const userModel = require('../models/user')
const addressModel = require('../models/address')

router.use(auth)

router.get('/profile', async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.userId)
    if (!user) return res.status(404).json(fail('用户不存在', 404))
    res.json(ok(user))
  } catch (err) { next(err) }
})

router.put('/profile', async (req, res, next) => {
  try {
    const { nickname, phone, avatar } = req.body
    const fields = {}
    if (nickname !== undefined) fields.nickname = nickname
    if (phone !== undefined) fields.phone = phone
    if (avatar !== undefined) fields.avatar = avatar
    if (Object.keys(fields).length === 0) {
      return res.status(400).json(fail('没有要更新的内容'))
    }
    await userModel.update(req.user.userId, fields)
    const user = await userModel.findById(req.user.userId)
    res.json(ok(user, '更新成功'))
  } catch (err) { next(err) }
})

router.get('/addresses', async (req, res, next) => {
  try {
    const addresses = await addressModel.findByUser(req.user.userId)
    res.json(ok(addresses))
  } catch (err) { next(err) }
})

router.post('/addresses', async (req, res, next) => {
  try {
    const id = await addressModel.create(req.user.userId, req.body)
    const addresses = await addressModel.findByUser(req.user.userId)
    res.json(ok(addresses, '添加成功'))
  } catch (err) { next(err) }
})

router.put('/addresses/:id', async (req, res, next) => {
  try {
    await addressModel.update(req.params.id, req.user.userId, req.body)
    const addresses = await addressModel.findByUser(req.user.userId)
    res.json(ok(addresses, '更新成功'))
  } catch (err) { next(err) }
})

router.delete('/addresses/:id', async (req, res, next) => {
  try {
    await addressModel.delete(req.params.id, req.user.userId)
    const addresses = await addressModel.findByUser(req.user.userId)
    res.json(ok(addresses, '删除成功'))
  } catch (err) { next(err) }
})

router.put('/password', async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json(fail('旧密码和新密码不能为空'))
    }
    if (newPassword.length < 6) {
      return res.status(400).json(fail('新密码长度至少6位'))
    }
    const user = await userModel.findByIdWithPassword(req.user.userId)
    if (!user) return res.status(404).json(fail('用户不存在', 404))
    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) return res.status(400).json(fail('旧密码不正确'))
    const hash = await bcrypt.hash(newPassword, 10)
    await userModel.update(req.user.userId, { password: hash })
    res.json(ok(null, '密码已更新'))
  } catch (err) { next(err) }
})

module.exports = router
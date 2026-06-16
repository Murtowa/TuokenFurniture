const router = require('express').Router()
const bcrypt = require('bcryptjs')
const { sign } = require('../utils/jwt')
const { ok, fail } = require('../utils/response')
const userModel = require('../models/user')
const adminModel = require('../models/admin')

router.post('/register', async (req, res, next) => {
  try {
    const { username, password, nickname, phone } = req.body
    if (!username || !password) {
      return res.status(400).json(fail('用户名和密码不能为空'))
    }
    const existing = await userModel.findByUsername(username)
    if (existing) {
      return res.status(400).json(fail('用户名已存在'))
    }
    const hash = await bcrypt.hash(password, 10)
    const id = await userModel.create({ username, password: hash, nickname, phone })
    const token = sign({ userId: id, role: 'user' })
    res.json(ok({ token, user: { id, username, nickname, phone } }, '注册成功'))
  } catch (err) { next(err) }
})

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json(fail('用户名和密码不能为空'))
    }
    const user = await userModel.findByUsername(username)
    if (!user) return res.status(400).json(fail('用户名或密码错误'))
    if (user.status === 0) return res.status(403).json(fail('账户已被禁用'))
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(400).json(fail('用户名或密码错误'))
    const token = sign({ userId: user.id, role: 'user' })
    res.json(ok({
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname, phone: user.phone, avatar: user.avatar }
    }, '登录成功'))
  } catch (err) { next(err) }
})

router.post('/admin-login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json(fail('用户名和密码不能为空'))
    }
    const admin = await adminModel.findByUsername(username)
    if (!admin) return res.status(400).json(fail('用户名或密码错误'))
    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) return res.status(400).json(fail('用户名或密码错误'))
    const token = sign({ userId: admin.id, role: 'admin' })
    res.json(ok({
      token,
      user: { id: admin.id, username: admin.username, nickname: admin.nickname, role: 'admin' }
    }, '登录成功'))
  } catch (err) { next(err) }
})

module.exports = router

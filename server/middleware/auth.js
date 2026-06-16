const { verify } = require('../utils/jwt')
const { fail } = require('../utils/response')

function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json(fail('请先登录', 401))
  }
  try {
    const token = header.split(' ')[1]
    req.user = verify(token)
    next()
  } catch (err) {
    return res.status(401).json(fail('登录已过期，请重新登录', 401))
  }
}

function adminAuth(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json(fail('无权限访问', 403))
  }
  next()
}

module.exports = { auth, adminAuth }

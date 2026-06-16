const { fail } = require('../utils/response')

function errorHandler(err, req, res, _next) {
  console.error('[Error]', err.message || err)
  const status = err.status || 500
  res.status(status).json(fail(err.message || '服务器内部错误', status))
}

module.exports = errorHandler

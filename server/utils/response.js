function ok(data = null, message = 'ok') {
  return { code: 200, message, data }
}

function fail(message = 'error', code = 400) {
  return { code, message, data: null }
}

module.exports = { ok, fail }

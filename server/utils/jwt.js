const jwt = require('jsonwebtoken')
require('dotenv').config()

const SECRET = process.env.JWT_SECRET || 'tuoken_jwt_secret_key_2026'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

function verify(token) {
  return jwt.verify(token, SECRET)
}

module.exports = { sign, verify }

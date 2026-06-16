const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tuoken_furniture'
  })

  const username = 'admin'
  const password = 'admin123'
  const hash = await bcrypt.hash(password, 10)

  const [existing] = await connection.execute(
    'SELECT id FROM admin_users WHERE username = ?', [username]
  )

  if (existing.length > 0) {
    console.log('Admin user already exists, updating password...')
    await connection.execute(
      'UPDATE admin_users SET password = ? WHERE username = ?', [hash, username]
    )
  } else {
    await connection.execute(
      'INSERT INTO admin_users (username, password, nickname, role) VALUES (?, ?, ?, ?)',
      [username, hash, '管理员', 'admin']
    )
  }

  console.log(`Admin user ready: ${username} / ${password}`)
  await connection.end()
}

seed().catch(err => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})

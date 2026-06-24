const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const uploadsDir = path.join(__dirname, '..', 'uploads')

// Generate a simple SVG placeholder image with a colored background and label
function generateSVG(width, height, bgColor, text, textColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${darkenColor(bgColor)};stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <text x="${width / 2}" y="${height / 2}" font-family="Arial,sans-serif" font-size="${Math.round(Math.min(width, height) * 0.08)}" fill="${textColor}" text-anchor="middle" dominant-baseline="central">${escapeXml(text)}</text>
</svg>`
}

function darkenColor(hex) {
  let r = parseInt(hex.slice(1, 3), 16)
  let g = parseInt(hex.slice(3, 5), 16)
  let b = parseInt(hex.slice(5, 7), 16)
  r = Math.max(0, r - 40)
  g = Math.max(0, g - 40)
  b = Math.max(0, b - 40)
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Data definitions with colors
const data = {
  banners: [
    { width: 1200, height: 520, color: '#2c3e50', text: '品质家电 焕新生活', textColor: '#ffffff', file: 'banner_1.svg' },
    { width: 1200, height: 520, color: '#8B6914', text: '智能家居 触手可及', textColor: '#ffffff', file: 'banner_2.svg' },
    { width: 1200, height: 520, color: '#1a5276', text: '夏日清凉季 空调冰箱限时特惠', textColor: '#ffffff', file: 'banner_3.svg' },
  ],
  categories: {
    '电视机': { color: '#e74c3c', file: 'cat_tv.svg' },
    '冰箱': { color: '#2980b9', file: 'cat_fridge.svg' },
    '空调': { color: '#27ae60', file: 'cat_ac.svg' },
    '洗衣机': { color: '#8e44ad', file: 'cat_washer.svg' },
  },
  products: {
    '电视机': [
      { name: '小米电视 65英寸 4K超高清', price: 2999, color: '#c0392b', file: 'prod_tv_1.svg' },
      { name: '海信 55英寸 ULED超画质', price: 2599, color: '#e74c3c', file: 'prod_tv_2.svg' },
      { name: 'TCL 75英寸 QLED量子点', price: 4999, color: '#d35400', file: 'prod_tv_3.svg' },
      { name: '索尼 55英寸 4K HDR智能电视', price: 4299, color: '#a93226', file: 'prod_tv_4.svg' },
    ],
    '冰箱': [
      { name: '海尔 双门冰箱 218升 风冷无霜', price: 1999, color: '#2471a3', file: 'prod_fridge_1.svg' },
      { name: '美的 三门冰箱 258升 变频节能', price: 2399, color: '#2980b9', file: 'prod_fridge_2.svg' },
      { name: '容声 对开门冰箱 536升 智能温控', price: 3299, color: '#1a5276', file: 'prod_fridge_3.svg' },
    ],
    '空调': [
      { name: '格力 壁挂式空调 1.5匹 变频冷暖', price: 2999, color: '#1e8449', file: 'prod_ac_1.svg' },
      { name: '美的 立式空调 3匹 新一级能效', price: 5999, color: '#27ae60', file: 'prod_ac_2.svg' },
      { name: '奥克斯 壁挂空调 大1匹 急速冷暖', price: 1899, color: '#2ecc71', file: 'prod_ac_3.svg' },
    ],
    '洗衣机': [
      { name: '海尔 滚筒洗衣机 10公斤 变频静音', price: 2699, color: '#7d3c98', file: 'prod_washer_1.svg' },
      { name: '小天鹅 波轮洗衣机 8公斤 智能称重', price: 1399, color: '#8e44ad', file: 'prod_washer_2.svg' },
      { name: '西门子 洗烘一体 10公斤 除菌除螨', price: 4599, color: '#6c3483', file: 'prod_washer_3.svg' },
    ],
  }
}

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tuoken_furniture'
  })

  console.log('=== 生成占位图片并填充数据 ===\n')

  // 1. Generate banner SVGs & insert
  console.log('[Banners] 生成轮播图...')
  for (let i = 0; i < data.banners.length; i++) {
    const b = data.banners[i]
    const dest = path.join(uploadsDir, b.file)
    const svg = generateSVG(b.width, b.height, b.color, b.text, b.textColor)
    fs.writeFileSync(dest, svg)
    console.log(`  ✓ ${b.file} (${svg.length} bytes)`)

    // Extract title from text
    const parts = b.text.split(' ')
    const title = parts.slice(0, 2).join(' ')
    const subtitle = parts.slice(2).join(' ') || ''

    await connection.execute(
      'INSERT INTO banners (image, title, subtitle, link, sort_order, status) VALUES (?, ?, ?, ?, ?, 1)',
      [b.file, title, subtitle || b.text.slice(3), '/products', i]
    )
  }
  console.log(`  已插入 ${data.banners.length} 条轮播图\n`)

  // 2. Generate category SVGs & insert
  console.log('[Categories] 生成分类图...')
  const categoryIds = {}
  for (const [name, cat] of Object.entries(data.categories)) {
    const dest = path.join(uploadsDir, cat.file)
    const svg = generateSVG(200, 200, cat.color, name, '#ffffff')
    fs.writeFileSync(dest, svg)
    console.log(`  ✓ ${cat.file} (${svg.length} bytes)`)

    const [result] = await connection.execute(
      'INSERT INTO categories (name, icon, sort_order) VALUES (?, ?, ?)',
      [name, cat.file, Object.keys(data.categories).indexOf(name)]
    )
    categoryIds[name] = result.insertId
  }
  console.log(`  已插入 ${Object.keys(data.categories).length} 个分类\n`)

  // 3. Generate product SVGs & insert
  console.log('[Products] 生成产品图...')
  let productCount = 0
  for (const [catName, products] of Object.entries(data.products)) {
    for (const p of products) {
      const dest = path.join(uploadsDir, p.file)
      // Show product name on image
      const displayText = p.name.length > 10 ? p.name.slice(0, 10) + '...' : p.name
      const svg = generateSVG(600, 600, p.color, displayText, '#ffffff')
      fs.writeFileSync(dest, svg)
      console.log(`  ✓ ${p.file} (${svg.length} bytes)`)

      await connection.execute(
        'INSERT INTO products (category_id, name, price, description, main_image, stock, status) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [categoryIds[catName], p.name, p.price, p.name + ' - 拓肯家电正品保障，全国联保', p.file, 100]
      )
      productCount++
    }
  }
  console.log(`  已插入 ${productCount} 个产品\n`)

  // 4. Update banner titles from the original data
  console.log('[Banners] 更新标题...')
  const bannerTitles = [
    { title: '品质家电 焕新生活', subtitle: '全场满2999包邮' },
    { title: '智能家居 触手可及', subtitle: '大牌正品 品质保证' },
    { title: '夏日清凉季', subtitle: '空调冰箱限时特惠' },
  ]
  const [banners] = await connection.query('SELECT id FROM banners ORDER BY sort_order')
  for (let i = 0; i < banners.length; i++) {
    await connection.execute(
      'UPDATE banners SET title = ?, subtitle = ? WHERE id = ?',
      [bannerTitles[i].title, bannerTitles[i].subtitle, banners[i].id]
    )
  }

  console.log('=== 数据填充完成! ===')
  console.log(`  Banners:  ${data.banners.length}`)
  console.log(`  Categories: ${Object.keys(data.categories).length}`)
  console.log(`  Products:   ${productCount}`)

  await connection.end()
}

seed().catch(err => {
  console.error('失败:', err.message)
  process.exit(1)
})

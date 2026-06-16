const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const errorHandler = require('./middleware/errorHandler')

// Routes
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const bannerRoutes = require('./routes/banners')
const cartRoutes = require('./routes/cart')
const orderRoutes = require('./routes/orders')
const userRoutes = require('./routes/user')
const uploadRoutes = require('./routes/upload')

// Admin routes
const adminDashboardRoutes = require('./routes/admin/dashboard')
const adminProductRoutes = require('./routes/admin/products')
const adminCategoryRoutes = require('./routes/admin/categories')
const adminOrderRoutes = require('./routes/admin/orders')
const adminUserRoutes = require('./routes/admin/users')

const app = express()

// Global middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Public routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/banners', bannerRoutes)

// Protected routes (user)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/user', userRoutes)
app.use('/api/upload', uploadRoutes)

// Admin routes
app.use('/api/admin', adminDashboardRoutes)
app.use('/api/admin', adminProductRoutes)
app.use('/api/admin', adminCategoryRoutes)
app.use('/api/admin', adminOrderRoutes)
app.use('/api/admin', adminUserRoutes)

// Error handler
app.use(errorHandler)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

module.exports = app

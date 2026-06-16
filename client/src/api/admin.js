import request from '@/utils/request'

// Dashboard
export function getDashboard() {
  return request.get('/admin/dashboard')
}

// Products
export function adminGetProducts(params) {
  return request.get('/admin/products', { params })
}

export function adminCreateProduct(data) {
  return request.post('/admin/products', data)
}

export function adminUpdateProduct(id, data) {
  return request.put(`/admin/products/${id}`, data)
}

export function adminDeleteProduct(id) {
  return request.delete(`/admin/products/${id}`)
}

// Categories
export function adminGetCategories() {
  return request.get('/admin/categories')
}

export function adminCreateCategory(data) {
  return request.post('/admin/categories', data)
}

export function adminUpdateCategory(id, data) {
  return request.put(`/admin/categories/${id}`, data)
}

export function adminDeleteCategory(id) {
  return request.delete(`/admin/categories/${id}`)
}

// Orders
export function adminGetOrders(params) {
  return request.get('/admin/orders', { params })
}

export function adminGetOrderDetail(id) {
  return request.get(`/admin/orders/${id}`)
}

export function adminUpdateOrderStatus(id, data) {
  return request.put(`/admin/orders/${id}/status`, data)
}

// Users
export function adminGetUsers(params) {
  return request.get('/admin/users', { params })
}

export function adminUpdateUserStatus(id, data) {
  return request.put(`/admin/users/${id}/status`, data)
}

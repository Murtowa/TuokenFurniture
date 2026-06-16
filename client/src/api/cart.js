import request from '@/utils/request'

export function getCart() {
  return request.get('/cart')
}

export function addToCart(data) {
  return request.post('/cart', data)
}

export function updateCartItem(id, data) {
  return request.put(`/cart/${id}`, data)
}

export function removeCartItem(id) {
  return request.delete(`/cart/${id}`)
}

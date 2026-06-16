import request from '@/utils/request'

export function createOrder(data) {
  return request.post('/orders', data)
}

export function getOrders(params) {
  return request.get('/orders', { params })
}

export function getOrderDetail(id) {
  return request.get(`/orders/${id}`)
}

export function cancelOrder(id) {
  return request.put(`/orders/${id}/cancel`)
}

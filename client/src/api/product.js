import request from '@/utils/request'

export function getProducts(params) {
  return request.get('/products', { params })
}

export function getProductDetail(id) {
  return request.get(`/products/${id}`)
}

export function getCategories() {
  return request.get('/categories')
}

export function getBanners() {
  return request.get('/banners')
}

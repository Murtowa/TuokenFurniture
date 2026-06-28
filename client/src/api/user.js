import request from '@/utils/request'

export function getProfile() {
  return request.get('/user/profile')
}

export function updateProfile(data) {
  return request.put('/user/profile', data)
}

export function getAddresses() {
  return request.get('/user/addresses')
}

export function addAddress(data) {
  return request.post('/user/addresses', data)
}

export function updateAddress(id, data) {
  return request.put(`/user/addresses/${id}`, data)
}

export function deleteAddress(id) {
  return request.delete(`/user/addresses/${id}`)
}

export function changePassword(data) {
  return request.put('/user/password', data)
}

export function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request.post('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
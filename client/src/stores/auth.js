import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authApi from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setAuth(t, u) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
  }

  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  async function login(credentials) {
    const data = await authApi.login(credentials)
    setAuth(data.token, data.user)
    return data
  }

  async function adminLogin(credentials) {
    const data = await authApi.adminLogin(credentials)
    setAuth(data.token, data.user)
    return data
  }

  async function register(credentials) {
    const data = await authApi.register(credentials)
    setAuth(data.token, data.user)
    return data
  }

  function logout() {
    clearAuth()
  }

  return { token, user, isLoggedIn, isAdmin, login, adminLogin, register, logout, setAuth, clearAuth }
})

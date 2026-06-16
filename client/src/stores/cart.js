import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as cartApi from '@/api/cart'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  function loadLocal() {
    const raw = localStorage.getItem('cart_local')
    if (raw) items.value = JSON.parse(raw)
  }

  function saveLocal() {
    localStorage.setItem('cart_local', JSON.stringify(items.value))
  }

  async function fetch() {
    const auth = useAuthStore()
    if (auth.isLoggedIn) {
      const data = await cartApi.getCart()
      items.value = data || []
    } else {
      loadLocal()
    }
  }

  async function add(productId, quantity = 1) {
    const auth = useAuthStore()
    if (auth.isLoggedIn) {
      await cartApi.addToCart({ productId, quantity })
      await fetch()
      ElMessage.success('已加入购物车')
    } else {
      loadLocal()
      const idx = items.value.findIndex(i => i.product_id === productId || i.productId === productId)
      if (idx > -1) {
        items.value[idx].quantity += quantity
      } else {
        items.value.push({ productId, quantity })
      }
      saveLocal()
      ElMessage.success('已加入购物车')
    }
  }

  async function updateQuantity(id, quantity) {
    const auth = useAuthStore()
    if (auth.isLoggedIn) {
      await cartApi.updateCartItem(id, { quantity })
      await fetch()
    }
  }

  async function remove(id) {
    const auth = useAuthStore()
    if (auth.isLoggedIn) {
      await cartApi.removeCartItem(id)
      await fetch()
    } else {
      items.value = items.value.filter((_, i) => i !== id)
      saveLocal()
    }
  }

  async function mergeLocal() {
    const raw = localStorage.getItem('cart_local')
    if (raw) {
      const local = JSON.parse(raw)
      if (local.length > 0) {
        for (const item of local) {
          await cartApi.addToCart({ productId: item.productId || item.product_id, quantity: item.quantity })
        }
        localStorage.removeItem('cart_local')
      }
    }
    await fetch()
  }

  function clearLocal() {
    items.value = []
    localStorage.removeItem('cart_local')
  }

  return { items, fetch, add, updateQuantity, remove, mergeLocal, clearLocal, loadLocal, saveLocal }
})

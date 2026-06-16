import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as orderApi from '@/api/order'
import { useCartStore } from './cart'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const total = ref(0)
  const loading = ref(false)

  async function fetchOrders(page = 1) {
    loading.value = true
    try {
      const data = await orderApi.getOrders({ page, pageSize: 10 })
      orders.value = data.list
      total.value = data.total
    } finally {
      loading.value = false
    }
  }

  async function placeOrder({ addressId, items, remark }) {
    const data = await orderApi.createOrder({ addressId, items, remark })
    const cart = useCartStore()
    await cart.fetch()
    return data
  }

  async function cancel(id) {
    await orderApi.cancelOrder(id)
  }

  return { orders, total, loading, fetchOrders, placeOrder, cancel }
})

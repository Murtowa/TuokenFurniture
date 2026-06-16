import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getDashboard } from '@/api/admin'

export const useDashboardStore = defineStore('adminDashboard', () => {
  const counts = ref({ products: 0, orders: 0, revenue: 0, users: 0 })
  const orderTrend = ref([])
  const categoryDistribution = ref([])
  const recentOrders = ref([])
  const loading = ref(false)

  async function fetch() {
    loading.value = true
    try {
      const data = await getDashboard()
      counts.value = data.counts
      orderTrend.value = data.orderTrend
      categoryDistribution.value = data.categoryDistribution
      recentOrders.value = data.recentOrders
    } finally {
      loading.value = false
    }
  }

  return { counts, orderTrend, categoryDistribution, recentOrders, loading, fetch }
})

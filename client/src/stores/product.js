import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as productApi from '@/api/product'

export const useProductStore = defineStore('product', () => {
  const list = ref([])
  const total = ref(0)
  const loading = ref(false)
  const filters = ref({
    categoryId: null,
    keyword: '',
    sort: 'default',
    page: 1,
    pageSize: 12
  })

  async function fetchProducts() {
    loading.value = true
    try {
      const data = await productApi.getProducts({
        page: filters.value.page,
        pageSize: filters.value.pageSize,
        categoryId: filters.value.categoryId,
        keyword: filters.value.keyword,
        sort: filters.value.sort
      })
      list.value = data.list
      total.value = data.total
    } finally {
      loading.value = false
    }
  }

  function setFilter(key, value) {
    filters.value[key] = value
    if (key !== 'page') filters.value.page = 1
    fetchProducts()
  }

  function resetFilters() {
    filters.value = { categoryId: null, keyword: '', sort: 'default', page: 1, pageSize: 12 }
    fetchProducts()
  }

  return { list, total, loading, filters, fetchProducts, setFilter, resetFilters }
})

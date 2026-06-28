<template>
  <div class="cart-page">
    <div class="container">
      <!-- Breadcrumb -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>购物车</el-breadcrumb-item>
      </el-breadcrumb>

      <h2 class="page-title">我的购物车</h2>

      <!-- Empty Cart -->
      <el-empty v-if="!loading && store.items.length === 0" description="购物车是空的">
        <template #extra>
          <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
        </template>
      </el-empty>

      <!-- Cart Content -->
      <template v-else>
        <div class="cart-content">
          <!-- Cart Table -->
          <div class="cart-table-wrapper">
            <el-table
              :data="store.items"
              style="width: 100%"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="50" />

              <el-table-column label="商品" min-width="400">
                <template #default="{ row }">
                  <div class="product-cell" @click="goToProduct(row)">
                    <img
                      :src="`/uploads/${row.main_image || row.image}`"
                      class="product-thumb"
                      loading="lazy"
                    />
                    <div class="product-info">
                      <p class="product-name">{{ row.name || row.product_name }}</p>
                      <p class="product-spec" v-if="row.spec">{{ row.spec }}</p>
                    </div>
                  </div>
                </template>
              </el-table-column>

              <el-table-column label="单价" width="140" align="center">
                <template #default="{ row }">
                  <span class="price">&yen;{{ row.price || row.product_price }}</span>
                </template>
              </el-table-column>

              <el-table-column label="数量" width="160" align="center">
                <template #default="{ row, $index }">
                  <el-input-number
                    v-model="row.quantity"
                    :min="1"
                    :max="row.stock || 999"
                    size="small"
                    @change="handleQuantityChange(row, $index)"
                  />
                </template>
              </el-table-column>

              <el-table-column label="小计" width="140" align="center">
                <template #default="{ row }">
                  <span class="subtotal">
                    &yen;{{ ((row.price || row.product_price) * row.quantity).toFixed(2) }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="操作" width="80" align="center">
                <template #default="{ row, $index }">
                  <el-button
                    type="danger"
                    link
                    @click="handleRemove(row, $index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Bottom Bar -->
          <div class="cart-footer">
            <div class="left">
              <el-checkbox
                v-model="checkAll"
                :indeterminate="isIndeterminate"
                @change="handleCheckAllChange"
              >
                全选
              </el-checkbox>
            </div>
            <div class="right">
              <div class="summary">
                <span class="selected-count">
                  已选 <strong>{{ selectedItems.length }}</strong> 件
                </span>
                <span class="total-price">
                  合计: <strong>&yen;{{ totalPrice }}</strong>
                </span>
              </div>
              <el-button
                type="primary"
                size="large"
                :disabled="selectedItems.length === 0"
                @click="handleCheckout"
              >
                去结算
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const store = useCartStore()
const auth = useAuthStore()

const loading = ref(true)
const selectedItems = ref([])
const checkAll = ref(false)

const isIndeterminate = computed(() => {
  return selectedItems.value.length > 0 && selectedItems.value.length < store.items.length
})

const totalPrice = computed(() => {
  return selectedItems.value
    .reduce((sum, row) => {
      const price = row.price || row.product_price || 0
      const qty = row.quantity || 1
      return sum + price * qty
    }, 0)
    .toFixed(2)
})

function syncSelectedToStore() {
  store.selectedIds = selectedItems.value.map(row => row.id || row.product_id).filter(Boolean)
}

function handleSelectionChange(val) {
  selectedItems.value = val
  checkAll.value = val.length === store.items.length
  syncSelectedToStore()
}

function handleCheckAllChange(val) {
  selectedItems.value = val ? [...store.items] : []
  syncSelectedToStore()
}

async function handleQuantityChange(row, index) {
  const id = row.id || row.product_id
  if (!id) return
  await store.updateQuantity(id, row.quantity)
}

async function handleRemove(row, index) {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const id = row.id || row.product_id
    if (id) {
      await store.remove(id)
    } else {
      await store.remove(index)
    }
    selectedItems.value = selectedItems.value.filter(i => i !== row)
    ElMessage.success('已删除')
  } catch {
    // user cancelled
  }
}

function handleCheckout() {
  if (!auth.isLoggedIn) {
    ElMessage.warning('请先登录后再结算')
    router.push('/login?redirect=/checkout')
    return
  }
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  router.push('/checkout')
}

function goToProduct(row) {
  const id = row.product_id || row.productId || row.id
  if (id) {
    router.push(`/product/${id}`)
  }
}

onMounted(async () => {
  await store.fetch()
  loading.value = false
})
</script>

<style lang="scss" scoped>
.cart-page {
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 28px 24px;
  }

  .breadcrumb {
    margin-bottom: 24px;
    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: #8c8170;
        font-weight: 400;
      }
      &:last-child .el-breadcrumb__inner {
        color: #2c2416;
        font-weight: 500;
      }
    }
    :deep(.el-breadcrumb__separator) {
      color: #b8af9e;
    }
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #2c2416;
    margin: 0 0 40px;
    position: relative;
    padding-bottom: 12px;
    letter-spacing: -0.02em;
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 40px;
      height: 3px;
      background: #8B6914;
      border-radius: 1.5px;
    }
  }

  .cart-content {
    background: #fff;
    border-radius: 12px;
    border: 1px solid #f0ece5;
    overflow: hidden;
  }

  .cart-table-wrapper {
    :deep(.el-table) {
      --el-table-header-bg-color: #faf8f5;
      --el-table-header-text-color: #2c2416;
      --el-table-text-color: #2c2416;
      --el-table-row-hover-bg-color: #fdf9f2;
      --el-table-border-color: #f0ece5;

      .el-table__header th {
        padding: 16px 0;
        font-weight: 600;
        letter-spacing: 0.02em;
        border-bottom: 1px solid #e8e3dc;
      }

      .el-table__body td {
        padding: 16px 0;
      }

      .product-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        &:hover .product-name {
          color: #8B6914;
        }
        .product-thumb {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          flex-shrink: 0;
          background: #faf8f5;
        }
        .product-info {
          .product-name {
            font-size: 14px;
            color: #2c2416;
            margin: 0 0 4px;
            transition: color 0.2s;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            letter-spacing: 0.02em;
          }
          .product-spec {
            font-size: 12px;
            color: #b8af9e;
            margin: 0;
          }
        }
      }
      .price {
        font-size: 15px;
        color: #2c2416;
        font-weight: 500;
      }
      .subtotal {
        font-size: 16px;
        font-weight: 700;
        color: #c0392b;
      }
    }
  }

  .cart-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    background: #faf8f5;
    border-top: 1px solid #f0ece5;
    .left {
      flex-shrink: 0;
      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #8B6914;
        border-color: #8B6914;
      }
      :deep(.el-checkbox__inner:hover) {
        border-color: #8B6914;
      }
      :deep(.el-checkbox__label) {
        color: #2c2416;
      }
    }
    .right {
      display: flex;
      align-items: center;
      gap: 20px;
      .summary {
        display: flex;
        align-items: center;
        gap: 16px;
        .selected-count {
          font-size: 14px;
          color: #8c8170;
          letter-spacing: 0.02em;
          strong {
            color: #2c2416;
          }
        }
        .total-price {
          font-size: 16px;
          color: #2c2416;
          letter-spacing: 0.02em;
          strong {
            font-size: 24px;
            color: #c0392b;
            font-weight: 700;
          }
        }
      }
    }
  }

  :deep(.el-button--primary) {
    background: #8B6914;
    border-color: #8B6914;
    border-radius: 8px;
    &:hover {
      background: #a68b3c;
      border-color: #a68b3c;
    }
  }

  :deep(.el-button--danger.is-link) {
    color: #c0392b;
    &:hover {
      color: #e74c3c;
    }
  }

  :deep(.el-input-number .el-input__wrapper) {
    border-radius: 8px;
  }
}
</style>
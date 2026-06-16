<template>
  <div class="cart-page container">
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
            :header-cell-style="{ background: '#f5f7fa', color: '#303133' }"
          >
            <el-table-column type="selection" width="50" />

            <el-table-column label="商品" min-width="400">
              <template #default="{ row }">
                <div class="product-cell" @click="goToProduct(row)">
                  <el-image
                    :src="`/uploads/${row.main_image || row.image}`"
                    fit="cover"
                    class="product-thumb"
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
                <span class="price">¥{{ row.price || row.product_price }}</span>
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
                  ¥{{ ((row.price || row.product_price) * row.quantity).toFixed(2) }}
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
                合计: <strong>¥{{ totalPrice }}</strong>
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

function handleSelectionChange(val) {
  selectedItems.value = val
  checkAll.value = val.length === store.items.length
}

function handleCheckAllChange(val) {
  // el-table selection is handled by ref; we use the table ref approach
  // For simplicity, we manage via checkAll toggle logic
  selectedItems.value = val ? [...store.items] : []
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
    router.push('/login')
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
    padding: 20px;
  }

  .breadcrumb {
    margin-bottom: 20px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 24px;
  }

  .cart-content {
    background: #fff;
    border-radius: 8px;
    border: 1px solid #ebeef5;
    overflow: hidden;
  }

  .cart-table-wrapper {
    :deep(.el-table) {
      .product-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        cursor: pointer;
        &:hover .product-name {
          color: #409eff;
        }
        .product-thumb {
          width: 80px;
          height: 80px;
          border-radius: 6px;
          flex-shrink: 0;
          background: #f5f7fa;
        }
        .product-info {
          .product-name {
            font-size: 14px;
            color: #303133;
            margin: 0 0 4px;
            transition: color 0.2s;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .product-spec {
            font-size: 12px;
            color: #909399;
            margin: 0;
          }
        }
      }
      .price {
        font-size: 15px;
        color: #303133;
        font-weight: 500;
      }
      .subtotal {
        font-size: 16px;
        font-weight: 700;
        color: #e74c3c;
      }
    }
  }

  .cart-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #fff;
    border-top: 1px solid #ebeef5;
    .left {
      flex-shrink: 0;
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
          color: #606266;
          strong {
            color: #303133;
          }
        }
        .total-price {
          font-size: 16px;
          color: #303133;
          strong {
            font-size: 22px;
            color: #e74c3c;
            font-weight: 700;
          }
        }
      }
    }
  }
}
</style>

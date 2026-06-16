<template>
  <div class="user-orders-page">
    <div class="container">
      <h2 class="page-title">我的订单</h2>

      <div v-loading="ordersStore.loading" class="orders-content">
        <template v-if="ordersStore.orders.length > 0">
          <div class="order-cards">
            <div v-for="order in ordersStore.orders" :key="order.id" class="order-card">
              <div class="order-header">
                <div class="order-header-left">
                  <span class="order-no">订单号: {{ order.orderNo || order.order_no }}</span>
                  <span class="order-date">{{ formatTime(order.createdAt || order.created_at) }}</span>
                </div>
                <el-tag :class="['status-tag', 'status-' + order.status]" size="small">
                  {{ statusMap[order.status]?.text || order.status }}
                </el-tag>
              </div>
              <div class="order-body">
                <div class="order-products" v-if="order.items && order.items.length > 0">
                  <div v-for="item in order.items.slice(0, 3)" :key="item.id" class="order-product-item">
                    <img :src="item.image || item.cover" alt="" class="order-product-img" />
                    <div class="order-product-info">
                      <span class="order-product-name">{{ item.name }}</span>
                      <span class="order-product-meta">&yen;{{ item.price }} x{{ item.quantity }}</span>
                    </div>
                  </div>
                  <span v-if="order.items.length > 3" class="more-items">
                    等{{ order.items.length }}件商品
                  </span>
                </div>
                <div class="order-meta">
                  <span class="order-amount">&yen;{{ order.totalAmount || order.total_amount }}</span>
                </div>
              </div>
              <div class="order-footer">
                <el-button size="small" @click="showOrderDetail(order)">查看详情</el-button>
                <el-button
                  v-if="order.status === 'pending'"
                  size="small"
                  class="btn-cancel"
                  :loading="cancellingId === order.id"
                  @click="handleCancel(order)"
                >
                  取消订单
                </el-button>
                <el-button
                  v-if="order.status === 'shipped'"
                  size="small"
                  class="btn-confirm"
                  @click="handleConfirmReceive(order)"
                >
                  确认收货
                </el-button>
              </div>
            </div>
          </div>

          <div class="pagination-wrap">
            <el-pagination
              v-model:current-page="currentPage"
              :total="ordersStore.total"
              :page-size="10"
              layout="prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </template>
        <div v-else-if="!ordersStore.loading" class="empty-hint">
          <p>暂无订单</p>
          <el-button type="primary" @click="$router.push('/products')">去逛逛</el-button>
        </div>
      </div>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="620px" destroy-on-close>
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>订单信息</h4>
          <p>订单号: {{ currentOrder.orderNo || currentOrder.order_no }}</p>
          <p>订单状态:
            <el-tag :class="['status-tag', 'status-' + currentOrder.status]" size="small">
              {{ statusMap[currentOrder.status]?.text || currentOrder.status }}
            </el-tag>
          </p>
          <p>下单时间: {{ formatTime(currentOrder.createdAt || currentOrder.created_at) }}</p>
          <p>订单金额: <span class="price">&yen;{{ currentOrder.totalAmount || currentOrder.total_amount }}</span></p>
          <p v-if="currentOrder.remark">备注: {{ currentOrder.remark }}</p>
        </div>

        <div v-if="currentOrder.items && currentOrder.items.length > 0" class="detail-section">
          <h4>商品列表</h4>
          <div v-for="item in currentOrder.items" :key="item.id" class="detail-item">
            <img :src="item.image || item.cover" alt="" class="detail-item-img" />
            <div class="detail-item-info">
              <div class="detail-item-name">{{ item.name }}</div>
              <div class="detail-item-meta">
                <span class="price">&yen;{{ item.price }}</span>
                <span>x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentOrder.address" class="detail-section">
          <h4>收货地址</h4>
          <p>{{ currentOrder.address.consignee }} {{ currentOrder.address.phone }}</p>
          <p>{{ currentOrder.address.province }}{{ currentOrder.address.city }}{{ currentOrder.address.district }} {{ currentOrder.address.detail }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as orderApi from '@/api/order'

const router = useRouter()
const ordersStore = useOrderStore()

const currentPage = ref(1)
const cancellingId = ref(null)
const detailVisible = ref(false)
const currentOrder = ref(null)

const statusMap = {
  pending: { type: 'info', text: '待付款' },
  paid: { type: '', text: '已付款' },
  shipped: { type: 'warning', text: '已发货' },
  completed: { type: 'success', text: '已完成' },
  cancelled: { type: 'danger', text: '已取消' }
}

function formatTime(t) {
  if (!t) return ''
  return new Date(t).toLocaleString('zh-CN', { hour12: false })
}

async function handlePageChange(page) {
  currentPage.value = page
  await ordersStore.fetchOrders(page)
}

async function handleCancel(order) {
  try {
    await ElMessageBox.confirm('确认取消该订单？', '提示', { type: 'warning' })
  } catch { return }
  cancellingId.value = order.id
  try {
    await ordersStore.cancel(order.id)
    ElMessage.success('订单已取消')
    order.status = 'cancelled'
  } catch {
    ElMessage.error('取消失败')
  } finally {
    cancellingId.value = null
  }
}

function handleConfirmReceive(order) {
  ElMessageBox.confirm('确认已收到商品？', '确认收货', { type: 'success' })
    .then(() => {
      ElMessage.info('确认收货功能开发中，敬请期待')
    })
    .catch(() => {})
}

async function showOrderDetail(order) {
  try {
    currentOrder.value = await orderApi.getOrderDetail(order.id)
  } catch {
    currentOrder.value = { ...order }
  }
  detailVisible.value = true
}

onMounted(() => {
  ordersStore.fetchOrders(currentPage.value)
})
</script>

<style lang="scss" scoped>
.user-orders-page {
  .container {
    max-width: 860px;
    margin: 0 auto;
    padding: 28px 24px 80px;
  }
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c2416;
  margin: 0 0 32px 0;
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

.orders-content { min-height: 300px; }

.order-cards { display: flex; flex-direction: column; gap: 16px; }

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0ece5;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 4px 16px rgba(44, 36, 22, 0.08);
    transform: translateY(-2px);
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0ece5;
  margin-bottom: 16px;
}

.order-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-no { font-size: 14px; color: #2c2416; font-weight: 500; letter-spacing: 0.02em; }
.order-date { font-size: 12px; color: #b8af9e; }

// Status tags
.status-tag {
  font-size: 12px;
  border-radius: 4px;
  padding: 4px 10px;
  border: none;
  &.status-pending { background: #f5f0e8; color: #b8af9e; }
  &.status-paid { background: #fdf6e8; color: #8B6914; }
  &.status-shipped { background: #fef5f0; color: #c17817; }
  &.status-completed { background: #f0f9eb; color: #5b8c5a; }
  &.status-cancelled { background: #fef5f5; color: #c0392b; }
}

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.order-products {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.order-product-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.order-product-img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 6px;
  background: #faf8f5;
  flex-shrink: 0;
}

.order-product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-product-name {
  font-size: 13px;
  color: #2c2416;
  letter-spacing: 0.02em;
}

.order-product-meta {
  font-size: 12px;
  color: #b8af9e;
}

.more-items {
  font-size: 12px;
  color: #8c8170;
  white-space: nowrap;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.order-amount {
  color: #c0392b;
  font-weight: 700;
  font-size: 18px;
}

.order-footer {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0ece5;

  :deep(.el-button) {
    border-radius: 6px;
    color: #8c8170;
    border-color: #e8e3dc;
    &:hover {
      color: #8B6914;
      border-color: #8B6914;
    }
  }

  .btn-cancel {
    color: #c0392b !important;
    border-color: #f0d9d9 !important;
    &:hover {
      background: #fef5f5 !important;
      border-color: #c0392b !important;
    }
  }

  .btn-confirm {
    color: #5b8c5a !important;
    border-color: #d4e8d4 !important;
    &:hover {
      background: #f0f9eb !important;
      border-color: #5b8c5a !important;
    }
  }
}

.empty-hint { text-align: center; padding: 60px 0; color: #b8af9e; }

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  :deep(.el-pagination.is-background) {
    .el-pager li.is-active {
      background-color: #8B6914;
    }
    .el-pager li:hover {
      color: #8B6914;
    }
  }
}

// 详情弹窗
.order-detail { font-size: 14px; }

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0ece5;

  &:last-child { border-bottom: none; margin-bottom: 0; }

  h4 { margin: 0 0 10px 0; color: #2c2416; font-size: 15px; font-weight: 600; letter-spacing: 0.02em; }

  p { margin: 6px 0; color: #8c8170; }
}

.price { color: #c0392b; font-weight: 600; }

.detail-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #faf8f5;

  &:last-child { border-bottom: none; }
}

.detail-item-img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  background: #faf8f5;
}

.detail-item-info { flex: 1; }
.detail-item-name { color: #2c2416; }
.detail-item-meta { display: flex; gap: 12px; margin-top: 4px; color: #b8af9e; font-size: 13px; }

:deep(.el-button--primary) {
  background: #8B6914;
  border-color: #8B6914;
  border-radius: 8px;
  &:hover {
    background: #a68b3c;
    border-color: #a68b3c;
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
}
</style>

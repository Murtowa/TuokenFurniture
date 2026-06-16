<template>
  <div class="user-orders-page">
    <h2 class="page-title">我的订单</h2>

    <div v-loading="ordersStore.loading" class="orders-content">
      <template v-if="ordersStore.orders.length > 0">
        <div class="order-cards">
          <div v-for="order in ordersStore.orders" :key="order.id" class="order-card">
            <div class="order-header">
              <span class="order-no">订单号: {{ order.orderNo || order.order_no }}</span>
              <el-tag :type="statusMap[order.status]?.type" size="small">
                {{ statusMap[order.status]?.text || order.status }}
              </el-tag>
            </div>
            <div class="order-body">
              <div class="order-meta">
                <span>下单时间: {{ formatTime(order.createdAt || order.created_at) }}</span>
                <span class="order-amount">&yen;{{ order.totalAmount || order.total_amount }}</span>
              </div>
              <div class="order-actions">
                <el-button size="small" @click="showOrderDetail(order)">查看详情</el-button>
                <el-button
                  v-if="order.status === 'pending'"
                  size="small"
                  type="danger"
                  :loading="cancellingId === order.id"
                  @click="handleCancel(order)"
                >
                  取消订单
                </el-button>
                <el-button
                  v-if="order.status === 'shipped'"
                  size="small"
                  type="success"
                  @click="handleConfirmReceive(order)"
                >
                  确认收货
                </el-button>
              </div>
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

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="620px" destroy-on-close>
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>订单信息</h4>
          <p>订单号: {{ currentOrder.orderNo || currentOrder.order_no }}</p>
          <p>订单状态:
            <el-tag :type="statusMap[currentOrder.status]?.type" size="small">
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
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 20px 60px;
}

.page-title {
  font-size: 24px;
  color: #303133;
  margin: 0 0 24px 0;
  font-weight: 600;
}

.orders-content { min-height: 300px; }

.order-cards { display: flex; flex-direction: column; gap: 16px; }

.order-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px;
  box-shadow: 0 1px 8px rgba(0,0,0,.04);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid #f2f2f2;
  margin-bottom: 14px;
}

.order-no { font-size: 14px; color: #606266; }

.order-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #909399;
  font-size: 13px;
}

.order-amount {
  color: #e74c3c;
  font-weight: 700;
  font-size: 18px;
}

.order-actions { display: flex; gap: 8px; }

.empty-hint { text-align: center; padding: 60px 0; color: #909399; }

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

// 详情弹窗
.order-detail { font-size: 14px; }

.detail-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f2f2f2;

  &:last-child { border-bottom: none; margin-bottom: 0; }

  h4 { margin: 0 0 10px 0; color: #303133; font-size: 15px; }

  p { margin: 6px 0; color: #606266; }
}

.price { color: #e74c3c; font-weight: 600; }

.detail-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f9f9f9;

  &:last-child { border-bottom: none; }
}

.detail-item-img {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
}

.detail-item-info { flex: 1; }
.detail-item-name { color: #303133; }
.detail-item-meta { display: flex; gap: 12px; margin-top: 4px; color: #909399; font-size: 13px; }
</style>

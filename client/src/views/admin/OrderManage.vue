<template>
  <div class="order-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">订单管理</h2>
      <span class="page-subtitle">{{ total }} 条订单</span>
    </div>

    <!-- 搜索工具栏 -->
    <div class="toolbar-card">
      <div class="toolbar">
        <el-input
          v-model="orderNo"
          placeholder="搜索订单号..."
          clearable
          :prefix-icon="Search"
          class="toolbar-input"
          @keyup.enter="fetchList"
          @clear="fetchList"
        />
        <el-select v-model="statusFilter" placeholder="全部状态" clearable class="toolbar-select" @change="fetchList">
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button class="reset-btn" @click="resetFilters">重置</el-button>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="list" v-loading="loading" class="order-table">
        <el-table-column prop="order_no" label="订单号" width="200">
          <template #default="{ row }">
            <span class="order-no">{{ row.order_no }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户" width="110" />
        <el-table-column prop="total_amount" label="金额" width="140" align="right">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.total_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-pill" :class="'s-' + row.status">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" min-width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <template v-if="row.status === 'pending'">
                <el-button link size="small" class="act-pay" @click="handleAction(row, 'paid')">确认支付</el-button>
                <span class="act-divider" />
              </template>
              <template v-if="row.status === 'paid'">
                <el-button link size="small" class="act-ship" @click="handleAction(row, 'shipped')">确认发货</el-button>
                <span class="act-divider" />
              </template>
              <el-button link size="small" class="act-detail" @click="openDetail(row)">详情</el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无订单" :image-size="80" />
        </template>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrap" v-if="total > 0">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" width="600px" destroy-on-close class="detail-dialog">
      <template #header>
        <div class="dialog-header">
          <span class="dialog-title">订单详情</span>
          <span v-if="detail" class="status-pill" :class="'s-' + detail.status">{{ statusLabel(detail.status) }}</span>
        </div>
      </template>
      <div v-if="detail" class="order-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="detail-section-title">基本信息</div>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">订单号</span>
              <span class="detail-value order-no">{{ detail.order_no }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">用户</span>
              <span class="detail-value">{{ detail.username }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">金额</span>
              <span class="detail-value price-text">¥{{ detail.total_amount }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">下单时间</span>
              <span class="detail-value">{{ detail.created_at }}</span>
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="detail-section">
          <div class="detail-section-title">商品信息</div>
          <div class="detail-items-table">
            <div v-for="item in (detail.items || [])" :key="item.id" class="detail-product-row">
              <span class="dpr-name">{{ item.product_name || item.product_snapshot?.name }}</span>
              <span class="dpr-qty">x{{ item.quantity }}</span>
              <span class="dpr-price">¥{{ item.price }}</span>
            </div>
            <el-empty v-if="!(detail.items && detail.items.length)" description="无商品" :image-size="40" />
          </div>
        </div>

        <!-- 收货地址 -->
        <div v-if="detail.address_snapshot" class="detail-section">
          <div class="detail-section-title">收货地址</div>
          <div class="address-card">
            <div class="address-line">
              <span class="address-name">{{ detail.address_snapshot.receiver_name }}</span>
              <span class="address-phone">{{ detail.address_snapshot.phone }}</span>
            </div>
            <div class="address-line address-detail">
              {{ detail.address_snapshot.province }}{{ detail.address_snapshot.city }}{{ detail.address_snapshot.district }} {{ detail.address_snapshot.detail }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as adminApi from '@/api/admin'
import { ElMessage } from 'element-plus'

const orderNo = ref('')
const statusFilter = ref('')
const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const detailVisible = ref(false)
const detail = ref(null)

function statusLabel(s) {
  const map = { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成', cancelled: '已取消' }
  return map[s] || s
}

function resetFilters() {
  orderNo.value = ''
  statusFilter.value = ''
  fetchList()
}

async function fetchList() {
  loading.value = true
  try {
    const data = await adminApi.adminGetOrders({
      page: page.value,
      pageSize: pageSize.value,
      order_no: orderNo.value || undefined,
      status: statusFilter.value || undefined
    })
    list.value = data.list || []
    total.value = data.total || 0
  } catch { /* handled by interceptor */ } finally { loading.value = false }
}

async function handleAction(row, newStatus) {
  try {
    await adminApi.adminUpdateOrderStatus(row.id, { status: newStatus })
    ElMessage.success('操作成功')
    fetchList()
  } catch { /* handled by interceptor */ }
}

async function openDetail(row) {
  try {
    detail.value = await adminApi.adminGetOrderDetail(row.id)
    detailVisible.value = true
  } catch { /* handled by interceptor */ }
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.order-manage {
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

// ── Page header ──
.page-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 28px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c2416;
  margin: 0;
  letter-spacing: -0.01em;
}
.page-subtitle {
  font-size: 13px;
  color: #b8af9e;
  letter-spacing: 0.02em;
}

// ── Toolbar card ──
.toolbar-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  padding: 20px 24px;
  margin-bottom: 16px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.toolbar-input { width: 280px; }
.toolbar-select { width: 140px; }

.reset-btn {
  height: 38px;
  padding: 0 20px;
  color: #8c8170;
  border-color: #e8e3dc;
  border-radius: 8px;
  font-size: 13px;
  &:hover { color: #2c2416; border-color: #b8af9e; }
}

// ── Table ──
.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44,36,22,.04);
  overflow: hidden;
}

.order-no {
  font-family: 'SF Mono', 'JetBrains Mono', 'Consolas', monospace;
  font-size: 13px;
  color: #2c2416;
  letter-spacing: 0.01em;
}
.price-text {
  color: #c0392b;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

// ── Status pills ──
.status-pill {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.6;

  &.s-pending  { color: #b8af9e; background: #f5f3ef; }
  &.s-paid     { color: #8B6914; background: #fdf6e8; }
  &.s-shipped  { color: #c17817; background: #fef7ee; }
  &.s-completed { color: #5b8c5a; background: #f0f9eb; }
  &.s-cancelled { color: #c0392b; background: #fef0f0; }
}

// ── Action buttons ──
.action-cell {
  display: flex;
  align-items: center;
  gap: 0;
}
.act-divider {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: #e8e3dc;
  margin: 0 8px;
}
.act-pay, .act-ship, .act-detail {
  font-size: 13px !important;
  padding: 0 !important;
  height: auto !important;
}
.act-pay   { color: #8B6914 !important; &:hover { color: #a68b3c !important; } }
.act-ship  { color: #c17817 !important; &:hover { color: #d48a2a !important; } }
.act-detail { color: #8c8170 !important; &:hover { color: #2c2416 !important; } }

// ── Table overrides ──
:deep(.order-table) {
  --el-table-border-color: #f0ece5;

  .el-table__header th {
    background: #faf8f5;
    color: #8c8170;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    padding: 14px 16px;
    border-bottom: 2px solid #f0ece5;
  }
  .el-table__body td {
    padding: 14px 16px;
    color: #2c2416;
    border-bottom: 1px solid #f0ece5;
    font-size: 14px;
  }
  .el-table__body tr:hover > td {
    background: #fdf6e8;
    transition: background .15s ease;
  }
}

// ── Pagination ──
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
:deep(.el-pagination) {
  --el-pagination-hover-color: #8B6914;
  .el-pager li.is-active { background-color: #8B6914; border-color: #8B6914; }
  .btn-prev, .btn-next { border-radius: 8px; }
}

// ── Input/Select ──
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e8e3dc;
  box-shadow: 0 0 0 1px #e8e3dc inset;
  transition: all .2s ease;
  &.is-focus { border-color: #8B6914; box-shadow: 0 0 0 1px #8B6914 inset; }
  &:hover { border-color: #b8af9e; }
}
:deep(.el-select .el-input__wrapper) { border-radius: 8px; }
:deep(.el-button--primary) {
  --el-button-bg-color: #8B6914;
  --el-button-border-color: #8B6914;
  --el-button-hover-bg-color: #a68b3c;
  --el-button-hover-border-color: #a68b3c;
  border-radius: 8px;
}

// ── Dialog ──
:deep(.detail-dialog) {
  .el-dialog { border-radius: 12px; }
  .el-dialog__header { padding: 24px 24px 0; border-bottom: none; margin-bottom: 0; }
  .el-dialog__body { padding: 20px 24px 24px; }
}
.dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f0ece5;
}
.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #2c2416;
}

// ── Detail sections ──
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.detail-section {
  background: #faf8f5;
  border-radius: 10px;
  border: 1px solid #f0ece5;
  padding: 18px;
}
.detail-section-title {
  font-size: 13px;
  font-weight: 600;
  color: #b8af9e;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 14px;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px 32px;
}
.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.detail-label {
  font-size: 13px;
  color: #8c8170;
  flex-shrink: 0;
  min-width: 56px;
}
.detail-value {
  font-size: 14px;
  color: #2c2416;
  font-weight: 500;
}
.detail-items-table {
  .detail-product-row {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0ece5;
    &:last-child { border-bottom: none; }
  }
  .dpr-name { flex: 1; font-size: 14px; color: #2c2416; font-weight: 500; }
  .dpr-qty  { width: 50px; text-align: center; font-size: 13px; color: #8c8170; }
  .dpr-price { width: 80px; text-align: right; font-size: 14px; color: #c0392b; font-weight: 600; }
}
.address-card {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0ece5;
  padding: 14px 16px;
}
.address-line {
  display: flex;
  align-items: center;
  gap: 14px;
}
.address-name {
  font-size: 14px;
  color: #2c2416;
  font-weight: 500;
}
.address-phone {
  font-size: 13px;
  color: #8c8170;
}
.address-detail {
  margin-top: 6px;
  font-size: 13px;
  color: #8c8170;
}
</style>

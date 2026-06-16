<template>
  <div class="order-manage">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="orderNo"
          placeholder="搜索订单号"
          clearable
          class="toolbar-input"
          @keyup.enter="fetchList"
          @clear="fetchList"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" class="toolbar-select" @change="fetchList">
          <el-option label="全部" value="" />
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="total_amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.total_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="'status-' + row.status">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="时间" min-width="170" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary" link size="small"
              class="action-btn pay-btn"
              @click="handleAction(row, 'paid')"
            >
              确认支付
            </el-button>
            <el-button
              v-if="row.status === 'paid'"
              type="warning" link size="small"
              class="action-btn ship-btn"
              @click="handleAction(row, 'shipped')"
            >
              确认发货
            </el-button>
            <el-button type="primary" link size="small" class="action-btn detail-btn" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrap">
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

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="640px" destroy-on-close>
      <div v-if="detail" class="order-detail">
        <h4 class="detail-section-title">基本信息</h4>
        <div class="detail-info-grid">
          <div class="info-item">
            <span class="info-label">订单号</span>
            <span class="info-value">{{ detail.order_no }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">用户</span>
            <span class="info-value">{{ detail.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">金额</span>
            <span class="info-value price-text">¥{{ detail.total_amount }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态</span>
            <span class="status-tag" :class="'status-' + detail.status">{{ statusLabel(detail.status) }}</span>
          </div>
        </div>

        <h4 class="detail-section-title">商品列表</h4>
        <el-table :data="detail.items || []" size="small" class="detail-table">
          <el-table-column prop="product_name" label="商品名称" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">
              <span class="price-text">¥{{ row.price }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="detail.address" class="address-card">
          <h4 class="detail-section-title">收货地址</h4>
          <p class="address-recipient">{{ detail.address.name }} <span class="address-phone">{{ detail.address.phone }}</span></p>
          <p class="address-full">{{ detail.address.province }}{{ detail.address.city }}{{ detail.address.district }} {{ detail.address.detail }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

async function handleAction(row, newStatus) {
  try {
    await adminApi.adminUpdateOrderStatus(row.id, { status: newStatus })
    row.status = newStatus
    ElMessage.success('操作成功')
  } catch {
    // handled by interceptor
  }
}

async function openDetail(row) {
  try {
    detail.value = await adminApi.adminGetOrderDetail(row.id)
    detailVisible.value = true
  } catch {
    // handled by interceptor
  }
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.order-manage {
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-input {
  width: 240px;
}

.toolbar-select {
  width: 160px;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  overflow: hidden;
}

.price-text {
  color: #c0392b;
  font-weight: 600;
}

/* 状态标签 */
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.status-pending {
    color: #b8af9e;
    background: #f5f3ef;
  }
  &.status-paid {
    color: #8B6914;
    background: #fdf6e8;
  }
  &.status-shipped {
    color: #c17817;
    background: #fef7ee;
  }
  &.status-completed {
    color: #5b8c5a;
    background: #f0f9eb;
  }
  &.status-cancelled {
    color: #c0392b;
    background: #fef0f0;
  }
}

/* 表格去蓝化 */
:deep(.el-table) {
  --el-table-border-color: #f0ece5;
  border-radius: 8px;

  .el-table__header th {
    background: #faf8f5;
    color: #8c8170;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 14px 16px;
    border-bottom: 1px solid #f0ece5;
  }

  .el-table__body td {
    padding: 14px 16px;
    color: #2c2416;
    border-bottom: 1px solid #f0ece5;
  }

  .el-table__body tr:hover > td {
    background: #fdf6e8;
  }
}

/* 操作按钮 */
.action-btn {
  &.pay-btn:deep(.el-button) {
    color: #8B6914 !important;
    &:hover { color: #a68b3c !important; }
  }
  &.ship-btn:deep(.el-button) {
    color: #c17817 !important;
    &:hover { color: #d48a2a !important; }
  }
  &.detail-btn:deep(.el-button) {
    color: #8c8170 !important;
    &:hover { color: #2c2416 !important; }
  }
}

/* 分页 */
:deep(.el-pagination) {
  --el-pagination-hover-color: #8B6914;

  .el-pager li.is-active {
    background-color: #8B6914;
    border-color: #8B6914;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 输入/选择框 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e8e3dc;
  box-shadow: 0 0 0 1px #e8e3dc inset;

  &.is-focus {
    border-color: #8B6914;
    box-shadow: 0 0 0 1px #8B6914 inset;
  }
}

:deep(.el-select) {
  .el-input__wrapper {
    border-radius: 8px;
  }
}

/* 对话框 */
:deep(.el-dialog) {
  border-radius: 12px;

  .el-dialog__header {
    border-bottom: 1px solid #f0ece5;
    padding: 20px 24px;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
      color: #2c2416;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }
}

/* 订单详情 */
.order-detail {
  .detail-section-title {
    font-size: 15px;
    font-weight: 600;
    color: #2c2416;
    margin: 0 0 12px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid #f0ece5;
  }
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px;
  margin-bottom: 20px;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .info-label {
    font-size: 13px;
    color: #8c8170;
    flex-shrink: 0;
  }

  .info-value {
    font-size: 14px;
    color: #2c2416;
    font-weight: 500;
  }
}

.detail-table {
  margin-bottom: 0;
}

.address-card {
  margin-top: 20px;
  padding: 16px;
  background: #faf8f5;
  border-radius: 8px;
  border: 1px solid #f0ece5;

  .detail-section-title {
    margin-bottom: 10px;
  }

  .address-recipient {
    font-size: 14px;
    color: #2c2416;
    margin: 0 0 4px 0;
    font-weight: 500;

    .address-phone {
      color: #8c8170;
      margin-left: 12px;
    }
  }

  .address-full {
    font-size: 13px;
    color: #8c8170;
    margin: 0;
    line-height: 1.5;
  }
}
</style>

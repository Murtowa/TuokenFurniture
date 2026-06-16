<template>
  <div class="order-manage">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="orderNo"
          placeholder="搜索订单号"
          clearable
          style="width:240px;"
          @keyup.enter="fetchList"
          @clear="fetchList"
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width:160px;margin-left:12px;" @change="fetchList">
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
    <el-table :data="list" stripe v-loading="loading" style="margin-top:16px;">
      <el-table-column prop="order_no" label="订单号" width="180" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="total_amount" label="金额" width="120">
        <template #default="{ row }">¥{{ row.total_amount }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="时间" min-width="170" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending'"
            type="primary" link size="small"
            @click="handleAction(row, 'paid')"
          >
            确认支付
          </el-button>
          <el-button
            v-if="row.status === 'paid'"
            type="warning" link size="small"
            @click="handleAction(row, 'shipped')"
          >
            确认发货
          </el-button>
          <el-button type="info" link size="small" @click="openDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

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
      <div v-if="detail">
        <h4>基本信息</h4>
        <p>订单号：{{ detail.order_no }}</p>
        <p>用户：{{ detail.username }}</p>
        <p>金额：¥{{ detail.total_amount }}</p>
        <p>状态：
          <el-tag :type="statusType(detail.status)" size="small">{{ statusLabel(detail.status) }}</el-tag>
        </p>
        <h4 style="margin-top:16px;">商品列表</h4>
        <el-table :data="detail.items || []" size="small">
          <el-table-column prop="product_name" label="商品名称" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="price" label="单价" width="100" />
        </el-table>
        <div v-if="detail.address" style="margin-top:16px;">
          <h4>收货地址</h4>
          <p>{{ detail.address.name }} {{ detail.address.phone }}</p>
          <p>{{ detail.address.province }}{{ detail.address.city }}{{ detail.address.district }} {{ detail.address.detail }}</p>
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

function statusType(s) {
  const map = { pending: 'info', paid: '', shipped: 'warning', completed: 'success', cancelled: 'danger' }
  return map[s] || 'info'
}

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
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

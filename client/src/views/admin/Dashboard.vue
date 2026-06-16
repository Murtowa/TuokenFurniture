<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">商品总数</div>
          <div class="stat-value">{{ counts.products }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">本月订单</div>
          <div class="stat-value">{{ counts.orders }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">本月营收</div>
          <div class="stat-value">¥{{ counts.revenue }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-label">用户总数</div>
          <div class="stat-value">{{ counts.users }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="20" style="margin-top:20px;">
      <el-col :span="16">
        <div class="chart-card">
          <h3 class="chart-title">近7天订单趋势</h3>
          <div ref="trendChartRef" class="chart-container" />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-card">
          <h3 class="chart-title">商品分类占比</h3>
          <div ref="pieChartRef" class="chart-container" />
        </div>
      </el-col>
    </el-row>

    <!-- 最近订单 -->
    <div class="table-card" style="margin-top:20px;">
      <h3 class="chart-title">最近订单</h3>
      <el-table :data="recentOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row)" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" min-width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import * as adminApi from '@/api/admin'
import * as echarts from 'echarts'

const trendChartRef = ref(null)
const pieChartRef = ref(null)
let trendChart = null
let pieChart = null

const counts = reactive({ products: 0, orders: 0, revenue: 0, users: 0 })
const orderTrend = ref([])
const categoryDistribution = ref([])
const recentOrders = ref([])

function statusType(row) {
  const map = { pending: 'info', paid: '', shipped: 'warning', completed: 'success', cancelled: 'danger' }
  return map[row.status] || 'info'
}

function initTrendChart() {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: ['订单数', '金额'], bottom: 0 },
    grid: { left: 50, right: 50, top: 20, bottom: 30 },
    xAxis: { type: 'category', data: orderTrend.value.map(i => i.date) },
    yAxis: [
      { type: 'value', name: '订单数', minInterval: 1 },
      { type: 'value', name: '金额(¥)' }
    ],
    series: [
      {
        name: '订单数', type: 'line', data: orderTrend.value.map(i => i.count),
        smooth: true, itemStyle: { color: '#409eff' }
      },
      {
        name: '金额', type: 'line', yAxisIndex: 1,
        data: orderTrend.value.map(i => i.amount),
        smooth: true, itemStyle: { color: '#67c23a' }
      }
    ]
  })
}

function initPieChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  pieChart.setOption({
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', right: 10, top: 'center' },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
      label: { show: false },
      data: categoryDistribution.value.map(i => ({ name: i.name, value: i.count }))
    }]
  })
}

function updateCharts() {
  nextTick(() => {
    if (trendChart) trendChart.dispose()
    if (pieChart) pieChart.dispose()
    initTrendChart()
    initPieChart()
  })
}

onMounted(async () => {
  try {
    const data = await adminApi.getDashboard()
    Object.assign(counts, data.counts || {})
    orderTrend.value = data.orderTrend || []
    categoryDistribution.value = data.categoryDistribution || []
    recentOrders.value = data.recentOrders || []
    updateCharts()
  } catch {
    // handled by interceptor
  }
})

watch([orderTrend, categoryDistribution], updateCharts)
</script>

<style lang="scss" scoped>
.stat-row {
  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 24px 20px;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
    text-align: center;
  }
  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
  }
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 16px 0;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.table-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}
</style>

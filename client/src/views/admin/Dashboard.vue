<template>
  <div class="dashboard">
    <!-- 数据概览标题 -->
    <div class="section-title">数据概览</div>

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
    <el-row :gutter="20" class="chart-row">
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
    <div class="table-card">
      <h3 class="chart-title">最近订单</h3>
      <el-table :data="recentOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="'status-' + row.status">{{ statusLabel(row.status) }}</span>
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

function statusLabel(s) {
  const map = { pending: '待支付', paid: '已支付', shipped: '已发货', completed: '已完成', cancelled: '已取消' }
  return map[s] || s
}

function initTrendChart() {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  trendChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: {
      data: ['订单数', '金额'],
      bottom: 0,
      textStyle: { color: '#8c8170' }
    },
    grid: { left: 60, right: 60, top: 20, bottom: 36 },
    xAxis: {
      type: 'category',
      data: orderTrend.value.map(i => i.date),
      axisLine: { lineStyle: { color: '#e8e3dc' } },
      axisTick: { lineStyle: { color: '#e8e3dc' } },
      axisLabel: { color: '#8c8170' }
    },
    yAxis: [
      {
        type: 'value', name: '订单数', minInterval: 1,
        nameTextStyle: { color: '#8c8170' },
        axisLabel: { color: '#8c8170' },
        splitLine: { lineStyle: { color: '#f0ece5' } }
      },
      {
        type: 'value', name: '金额(¥)',
        nameTextStyle: { color: '#8c8170' },
        axisLabel: { color: '#8c8170' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '订单数', type: 'line', data: orderTrend.value.map(i => i.count),
        smooth: true,
        lineStyle: { color: '#8B6914', width: 2 },
        itemStyle: { color: '#8B6914' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(139,105,20,0.12)' },
          { offset: 1, color: 'rgba(139,105,20,0)' }
        ]) },
        symbol: 'circle',
        symbolSize: 6
      },
      {
        name: '金额', type: 'line', yAxisIndex: 1,
        data: orderTrend.value.map(i => i.amount),
        smooth: true,
        lineStyle: { color: '#c17817', width: 2 },
        itemStyle: { color: '#c17817' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(193,120,23,0.12)' },
          { offset: 1, color: 'rgba(193,120,23,0)' }
        ]) },
        symbol: 'circle',
        symbolSize: 6
      }
    ]
  })
}

function initPieChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  const colors = ['#8B6914', '#c17817', '#a68b3c', '#d4aa40', '#b8af9e']
  pieChart.setOption({
    color: colors,
    tooltip: { trigger: 'item' },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: { color: '#8c8170' }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['40%', '50%'],
      label: { show: false },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2
      },
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
.dashboard {
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c2416;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #8B6914;
  display: inline-block;
  min-width: 160px;
}

.stat-row {
  margin-bottom: 32px;

  :deep(.el-col) {
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      border: 1px solid #f0ece5;
      box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
      transition: box-shadow 0.2s ease;
      cursor: default;

      &:hover {
        box-shadow: 0 4px 16px rgba(44, 36, 22, 0.08);
      }
    }
  }
}

.stat-label {
  font-size: 13px;
  color: #b8af9e;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2c2416;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2416;
  margin: 0 0 16px 0;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
}

/* 表格去蓝化 */
:deep(.el-table) {
  --el-table-border-color: #f0ece5;
  border-radius: 8px;
  overflow: hidden;

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
</style>

<template>
  <div class="dashboard">
    <!-- 数据概览标题 -->
    <div class="section-title">数据概览</div>

    <!-- 统计卡片 -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon-wrap icon-products">
          <el-icon :size="22"><Goods /></el-icon>
        </div>
        <div class="stat-body">
          <div class="stat-label">商品总数</div>
          <div class="stat-value">{{ counts.products }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap icon-orders">
          <el-icon :size="22"><Document /></el-icon>
        </div>
        <div class="stat-body">
          <div class="stat-label">本月订单</div>
          <div class="stat-value">{{ counts.orders }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap icon-revenue">
          <el-icon :size="22"><Money /></el-icon>
        </div>
        <div class="stat-body">
          <div class="stat-label">本月营收</div>
          <div class="stat-value">¥{{ counts.revenue }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap icon-users">
          <el-icon :size="22"><UserFilled /></el-icon>
        </div>
        <div class="stat-body">
          <div class="stat-label">用户总数</div>
          <div class="stat-value">{{ counts.users }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="chart-grid">
      <div class="chart-card chart-card-wide">
        <div class="chart-card-accent-bar" />
        <h3 class="chart-title">近7天订单趋势</h3>
        <div ref="trendChartRef" class="chart-container" />
      </div>
      <div class="chart-card chart-card-narrow">
        <div class="chart-card-accent-bar" />
        <h3 class="chart-title">商品分类占比</h3>
        <div ref="pieChartRef" class="chart-container" />
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="table-card">
      <h3 class="table-title">最近订单</h3>
      <el-table :data="recentOrders" stripe>
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">¥{{ row.amount }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <span class="status-pill" :class="'status-' + row.status">{{ statusLabel(row.status) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" min-width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick } from 'vue'
import { Goods, Document, Money, UserFilled } from '@element-plus/icons-vue'
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
    grid: { left: 60, right: 60, top: 40, bottom: 36 },
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

/* ====== 区块标题 ====== */
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c2416;
  margin-bottom: 32px;
  padding-bottom: 14px;
  border-bottom: 2px solid #8B6914;
  display: inline-block;
  min-width: 160px;
}

/* ====== 统计卡片网格 ====== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  transition: box-shadow 0.25s ease, transform 0.2s ease;
  cursor: default;
  display: flex;
  align-items: center;
  gap: 18px;

  &:hover {
    box-shadow: 0 4px 20px rgba(44, 36, 22, 0.08);
    transform: translateY(-2px);
  }
}

.stat-icon-wrap {
  width: 52px;
  height: 52px;
  min-width: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.icon-products {
    background: rgba(139, 105, 20, 0.1);
    color: #8B6914;
  }

  &.icon-orders {
    background: rgba(193, 120, 23, 0.1);
    color: #c17817;
  }

  &.icon-revenue {
    background: rgba(92, 140, 90, 0.1);
    color: #5b8c5a;
  }

  &.icon-users {
    background: rgba(184, 175, 158, 0.15);
    color: #8c8170;
  }
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 13px;
  color: #b8af9e;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 500;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #2c2416;
  line-height: 1.1;
}

/* ====== 图表区 ====== */
.chart-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  position: relative;
  overflow: hidden;
}

.chart-card-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #8B6914;
  border-radius: 12px 12px 0 0;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2416;
  margin: 0 0 20px 0;
}

.chart-container {
  width: 100%;
  height: 350px;
}

/* ====== 表格卡片 ====== */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c2416;
  margin: 0 0 20px 0;
}

/* ====== 表格覆盖 ====== */
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
    font-size: 14px;
  }

  .el-table__body tr:hover > td {
    background: #fdf6e8;
  }
}

/* ====== 状态圆角标签 ====== */
.status-pill {
  display: inline-block;
  padding: 3px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.5;

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

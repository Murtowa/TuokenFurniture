<template>
  <div class="product-manage">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="keyword"
          placeholder="搜索商品名称"
          clearable
          class="toolbar-input"
          @keyup.enter="fetchList"
          @clear="fetchList"
        />
        <el-select v-model="categoryId" placeholder="分类筛选" clearable class="toolbar-select" @change="fetchList">
          <el-option label="全部分类" value="" />
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态下拉" clearable class="toolbar-select" @change="fetchList">
          <el-option label="全部状态" value="" />
          <el-option label="上架" value="1" />
          <el-option label="下架" value="0" />
        </el-select>
      </div>
      <el-button type="primary" class="add-btn" @click="$router.push('/admin/products/add')">新增商品</el-button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <img v-if="row.main_image" :src="row.main_image" class="product-thumb" />
            <div v-else class="product-thumb-placeholder" />
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              class="warm-switch"
              @change="toggleStatus(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" class="edit-btn" @click="$router.push(`/admin/products/${row.id}/edit`)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" class="delete-btn" @click="handleDelete(row)">
              删除
            </el-button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as adminApi from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const keyword = ref('')
const categoryId = ref('')
const statusFilter = ref('')
const list = ref([])
const categories = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

async function fetchList() {
  loading.value = true
  try {
    const data = await adminApi.adminGetProducts({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      category_id: categoryId.value || undefined,
      status: statusFilter.value !== '' ? statusFilter.value : undefined
    })
    list.value = data.list || []
    total.value = data.total || 0
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

async function toggleStatus(row) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await adminApi.adminUpdateProduct(row.id, { status: newStatus })
    row.status = newStatus
    ElMessage.success(newStatus === 1 ? '已上架' : '已下架')
  } catch {
    // handled by interceptor
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm('确定删除该商品？', '提示', { type: 'warning' })
  try {
    await adminApi.adminDeleteProduct(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    // handled by interceptor
  }
}

onMounted(async () => {
  try {
    const cats = await adminApi.adminGetCategories()
    categories.value = cats || []
  } catch { /* ignore */ }
  fetchList()
})
</script>

<style lang="scss" scoped>
.product-manage {
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
  gap: 16px;
}

.toolbar-input {
  width: 220px;
}

.toolbar-select {
  width: 160px;
}

.add-btn {
  height: 38px;
  padding: 0 20px;
  font-weight: 500;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 0;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  overflow: hidden;
}

.product-thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #f0ece5;
}

.product-thumb-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #faf8f5;
  border: 1px solid #f0ece5;
}

.price-text {
  color: #c0392b;
  font-weight: 600;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 输入/选择框样式覆盖 */
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

/* 主按钮 */
:deep(.el-button--primary) {
  --el-button-bg-color: #8B6914;
  --el-button-border-color: #8B6914;
  --el-button-hover-bg-color: #a68b3c;
  --el-button-hover-border-color: #a68b3c;
  --el-button-active-bg-color: #7a5b11;
  --el-button-active-border-color: #7a5b11;
  border-radius: 8px;
}

/* 链接按钮 - 编辑 */
.edit-btn:deep(.el-button) {
  color: #8B6914 !important;

  &:hover {
    color: #a68b3c !important;
  }
}

/* 链接按钮 - 删除 */
.delete-btn:deep(.el-button) {
  color: #c0392b !important;

  &:hover {
    color: #d94a3a !important;
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

/* 开关 */
:deep(.warm-switch) {
  --el-switch-on-color: #5b8c5a;
  --el-switch-off-color: #b8af9e;
}

/* 分页 */
:deep(.el-pagination) {
  --el-pagination-button-bg-color: #fff;
  --el-pagination-hover-color: #8B6914;

  .el-pager li.is-active {
    background-color: #8B6914;
    border-color: #8B6914;
  }
}
</style>

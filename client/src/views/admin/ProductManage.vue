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
      <el-button type="primary" class="add-btn" @click="$router.push('/admin/products/add')">
        <el-icon class="add-btn-icon"><Plus /></el-icon>
        新增商品
      </el-button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="list" stripe v-loading="loading" class="product-table">
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <img v-if="row.main_image" :src="'/uploads/' + row.main_image" class="product-thumb" />
            <div v-else class="product-thumb-placeholder">
              <el-icon :size="20"><PictureFilled /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="category_name" label="分类" width="100" />
        <el-table-column prop="price" label="价格" width="130">
          <template #default="{ row }">
            <span class="price-text">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column prop="status" label="状态" width="90">
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
import { Plus, PictureFilled } from '@element-plus/icons-vue'
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

/* ====== 工具栏 ====== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-input {
  width: 240px;
}

.toolbar-select {
  width: 160px;
}

.add-btn {
  height: 40px;
  padding: 0 24px;
  font-weight: 500;
  font-size: 14px;
}

.add-btn-icon {
  margin-right: 6px;
}

/* ====== 表格容器 ====== */
.table-card {
  background: #fff;
  border-radius: 12px;
  padding: 0;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  overflow: hidden;
}

/* ====== 商品缩略图 ====== */
.product-thumb {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #f0ece5;
  display: block;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.product-thumb-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: #faf8f5;
  border: 1px solid #f0ece5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b8af9e;
}

/* ====== 价格 ====== */
.price-text {
  color: #c0392b;
  font-weight: 600;
  font-size: 14px;
}

/* ====== 分页 ====== */
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* ====== 输入/选择框覆盖 ====== */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e8e3dc;
  box-shadow: 0 0 0 1px #e8e3dc inset;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;

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

/* ====== 主按钮 ====== */
:deep(.el-button--primary) {
  --el-button-bg-color: #8B6914;
  --el-button-border-color: #8B6914;
  --el-button-hover-bg-color: #a68b3c;
  --el-button-hover-border-color: #a68b3c;
  --el-button-active-bg-color: #7a5b11;
  --el-button-active-border-color: #7a5b11;
  border-radius: 8px;
}

/* ====== 链接按钮 - 编辑 ====== */
:deep(.edit-btn) {
  color: #8B6914 !important;

  &:hover {
    color: #a68b3c !important;
  }
}

/* ====== 链接按钮 - 删除 ====== */
:deep(.delete-btn) {
  color: #c0392b !important;

  &:hover {
    color: #d94a3a !important;
  }
}

/* ====== 表格覆盖 ====== */
:deep(.product-table) {
  --el-table-border-color: #f0ece5;
  border-radius: 8px;

  .el-table__header th {
    background: #faf8f5;
    color: #8c8170;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 16px;
    border-bottom: 1px solid #f0ece5;
  }

  .el-table__body td {
    padding: 16px;
    color: #2c2416;
    border-bottom: 1px solid #f0ece5;
    font-size: 14px;
  }

  .el-table__body tr:hover > td {
    background: #fdf6e8;
    transition: background 0.2s ease;
  }
}

/* ====== 开关 ====== */
:deep(.warm-switch) {
  --el-switch-on-color: #5b8c5a;
  --el-switch-off-color: #b8af9e;
}

/* ====== 分页 ====== */
:deep(.el-pagination) {
  --el-pagination-button-bg-color: #fff;
  --el-pagination-hover-color: #8B6914;

  .el-pager li.is-active {
    background-color: #8B6914;
    border-color: #8B6914;
  }
}

/* ====== 响应式 ====== */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .toolbar-input,
  .toolbar-select {
    width: 100%;
  }
}
</style>

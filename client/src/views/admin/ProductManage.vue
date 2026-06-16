<template>
  <div class="product-manage">
    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="keyword"
          placeholder="搜索商品名称"
          clearable
          style="width:220px;"
          @keyup.enter="fetchList"
          @clear="fetchList"
        />
        <el-select v-model="categoryId" placeholder="分类筛选" clearable style="width:160px;margin-left:12px;" @change="fetchList">
          <el-option label="全部分类" value="" />
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态下拉" clearable style="width:140px;margin-left:12px;" @change="fetchList">
          <el-option label="全部状态" value="" />
          <el-option label="上架" value="1" />
          <el-option label="下架" value="0" />
        </el-select>
      </div>
      <el-button type="primary" @click="$router.push('/admin/products/add')">新增商品</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" stripe v-loading="loading" style="margin-top:16px;">
      <el-table-column label="图片" width="80">
        <template #default="{ row }">
          <img v-if="row.main_image" :src="row.main_image" class="product-thumb" />
        </template>
      </el-table-column>
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="category_name" label="分类" width="120" />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">¥{{ row.price }}</template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === 1"
            @change="toggleStatus(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="$router.push(`/admin/products/${row.id}/edit`)">
            编辑
          </el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">
            删除
          </el-button>
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
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.product-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

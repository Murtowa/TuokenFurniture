<template>
  <div class="user-manage">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名/昵称"
        clearable
        class="toolbar-input"
        @keyup.enter="fetchList"
        @clear="fetchList"
      />
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="140" />
        <el-table-column prop="nickname" label="昵称" min-width="140" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="status-tag" :class="row.status === 1 ? 'status-enabled' : 'status-disabled'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" min-width="170" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              class="disable-btn"
              size="small"
              @click="handleToggle(row)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              type="primary" link size="small"
              class="enable-btn"
              @click="handleToggle(row)"
            >
              启用
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
import { ElMessage } from 'element-plus'

const keyword = ref('')
const list = ref([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

async function fetchList() {
  loading.value = true
  try {
    const data = await adminApi.adminGetUsers({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined
    })
    list.value = data.list || []
    total.value = data.total || 0
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

async function handleToggle(row) {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await adminApi.adminUpdateUserStatus(row.id, { status: newStatus })
    row.status = newStatus
    ElMessage.success(newStatus === 1 ? '已启用' : '已禁用')
  } catch {
    // handled by interceptor
  }
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.user-manage {
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-input {
  width: 260px;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  overflow: hidden;
}

/* 状态标签 */
.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;

  &.status-enabled {
    color: #5b8c5a;
    background: #f0f9eb;
  }

  &.status-disabled {
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

/* 启用按钮（轮廓样式） */
.disable-btn {
  border-radius: 8px;
  border: 1px solid #e8e3dc;
  background: #fff;
  color: #8c8170;
  font-size: 13px;
  padding: 4px 14px;
  height: auto;
  min-height: 30px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #c0392b;
    color: #c0392b;
    background: #fef0f0;
  }
}

/* 启用文本按钮 */
.enable-btn:deep(.el-button) {
  color: #8B6914 !important;
  font-size: 13px;

  &:hover {
    color: #a68b3c !important;
  }
}

/* 输入框 */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e8e3dc;
  box-shadow: 0 0 0 1px #e8e3dc inset;

  &:hover {
    border-color: #a68b3c;
  }

  &.is-focus {
    border-color: #8B6914;
    box-shadow: 0 0 0 1px #8B6914 inset;
  }
}

/* 分页 */
:deep(.el-pagination) {
  --el-pagination-hover-color: #8B6914;

  .el-pager li.is-active {
    background-color: #8B6914;
    border-color: #8B6914;
  }

  .btn-prev,
  .btn-next {
    border-radius: 8px;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

<template>
  <div class="user-manage">
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索用户名 / 昵称"
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
        <el-table-column label="用户" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <span class="avatar-circle">{{ row.username.charAt(0).toUpperCase() }}</span>
              <div class="user-info">
                <span class="user-name">{{ row.username }}</span>
                <span v-if="row.nickname" class="user-nick">{{ row.nickname }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="155" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 1 ? 'pill-enabled' : 'pill-disabled'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" min-width="140" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 1"
              class="btn-disable-outline"
              size="small"
              @click="handleToggle(row)"
            >
              禁用
            </el-button>
            <el-button
              v-else
              class="btn-enable-outline"
              size="small"
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

/* ===== 搜索工具栏 ===== */
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar-input {
  width: 300px;
}

/* ===== 表格容器 ===== */
.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  overflow: hidden;
}

/* ===== 用户头像列 ===== */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fdf6e8;
  color: #8B6914;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px solid #f0ece5;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #2c2416;
}

.user-nick {
  font-size: 12px;
  color: #b8af9e;
}

/* ===== 状态标签 pill ===== */
.status-pill {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  &.pill-enabled {
    color: #5b8c5a;
    background: #f0f9eb;
  }

  &.pill-disabled {
    color: #c0392b;
    background: #fef0f0;
  }
}

/* ===== 操作按钮 outline 样式 ===== */
.btn-disable-outline {
  border-radius: 8px;
  border: 1px solid #e8e3dc;
  background: #fff;
  color: #8c8170;
  font-size: 13px;
  padding: 5px 16px;
  height: auto;
  min-height: 32px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #c0392b;
    color: #c0392b;
    background: #fef0f0;
  }
}

.btn-enable-outline {
  border-radius: 8px;
  border: 1px solid #e8e3dc;
  background: #fff;
  color: #8c8170;
  font-size: 13px;
  padding: 5px 16px;
  height: auto;
  min-height: 32px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #5b8c5a;
    color: #5b8c5a;
    background: #f0f9eb;
  }
}

/* ===== 表格去蓝化 ===== */
:deep(.el-table) {
  --el-table-border-color: #f0ece5;
  border-radius: 8px;

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
    vertical-align: middle;
  }

  .el-table__body tr:hover > td {
    background: #fdf6e8;
  }
}

/* ===== 输入框 ===== */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e8e3dc;
  box-shadow: 0 0 0 1px #e8e3dc inset;
  transition: all 0.2s ease;

  &:hover {
    border-color: #a68b3c;
  }

  &.is-focus {
    border-color: #8B6914;
    box-shadow: 0 0 0 1px #8B6914 inset;
  }
}

/* ===== 分页 ===== */
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

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
</style>

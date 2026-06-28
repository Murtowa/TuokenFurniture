<template>
  <div class="category-manage">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <h2 class="section-title">分类管理</h2>
      <el-button type="primary" class="add-btn" @click="openDialog()">+ 新增分类</el-button>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length > 0" class="batch-bar">
      <span class="batch-label">当前页已选 {{ selectedRows.length }} 项</span>
      <el-button size="small" type="danger" @click="batchDelete">批量删除</el-button>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <el-table :data="list" stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="180" />
        <el-table-column label="父级分类" width="160">
          <template #default="{ row }">
            <span :class="{ 'parent-italic': !parentName(row.parent_id) }">
              {{ parentName(row.parent_id) || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" class="op-link op-edit" @click="openDialog(row)">编辑</el-button>
            <span class="op-divider"></span>
            <el-button type="primary" link size="small" class="op-link op-delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="cat-form">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="form.parent_id" placeholder="请选择（可选）" clearable style="width:100%;">
            <el-option label="无" :value="null" />
            <el-option
              v-for="c in parentOptions"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" class="sort-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="cancel-btn" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" class="confirm-btn" @click="handleSave">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as adminApi from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref([])
const loading = ref(false)
const selectedRows = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const submitting = ref(false)

const formRef = ref(null)
const form = ref({
  name: '',
  parent_id: null,
  sort_order: 0
})

const validateUniqueName = (_rule, value, callback) => {
  if (!value) return callback()
  const name = value.trim().toLowerCase()
  const dup = list.value.find(c => c.name.trim().toLowerCase() === name && c.id !== editId.value)
  if (dup) return callback(new Error('分类名称已存在'))
  callback()
}

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { validator: validateUniqueName, trigger: 'blur' }
  ]
}

const parentOptions = computed(() => {
  if (!isEdit.value) return list.value
  return list.value.filter(c => c.id !== editId.value)
})

function parentName(pid) {
  if (!pid) return ''
  const found = list.value.find(c => c.id === pid)
  return found?.name || ''
}

function handleSelectionChange(val) {
  selectedRows.value = val
}

async function fetchList() {
  loading.value = true
  try {
    const data = await adminApi.adminGetCategories()
    list.value = data || []
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  if (row) {
    isEdit.value = true
    editId.value = row.id
    form.value = {
      name: row.name,
      parent_id: row.parent_id || null,
      sort_order: row.sort_order || 0
    }
  } else {
    isEdit.value = false
    editId.value = null
    form.value = { name: '', parent_id: null, sort_order: 0 }
  }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const payload = { ...form.value }
    if (!payload.parent_id) payload.parent_id = null
    if (isEdit.value) {
      await adminApi.adminUpdateCategory(editId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await adminApi.adminCreateCategory(payload)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm('确定删除该分类？', '提示', { type: 'warning' })
  try {
    await adminApi.adminDeleteCategory(row.id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    // handled by interceptor
  }
}

async function batchDelete() {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 个分类？`, '批量删除', { type: 'warning' })
  try {
    const ids = selectedRows.value.map(r => r.id)
    const res = await adminApi.adminBatchDeleteCategories({ ids })
    ElMessage.success(res.message || '删除成功')
    selectedRows.value = []
    fetchList()
  } catch { /* handled by interceptor */ }
}

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.category-manage {
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ===== 批量操作栏 ===== */
.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fdf6e8;
  border: 1px solid #f0d78c;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
}

.batch-label {
  font-size: 14px;
  font-weight: 600;
  color: #8B6914;
}

/* ===== 顶部工具栏 ===== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #2c2416;
  margin: 0;
}

.add-btn {
  height: 38px;
  padding: 0 22px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

/* ===== 表格容器 ===== */
.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  overflow: hidden;
}

/* 父级分类样式 */
.parent-italic {
  font-style: italic;
  color: #b8af9e;
}

/* ===== 操作按钮区 ===== */
.op-link {
  font-size: 13px;
  padding: 0;

  &.op-edit {
    color: #8B6914 !important;
    &:hover { color: #a68b3c !important; }
  }

  &.op-delete {
    color: #c0392b !important;
    &:hover { color: #d94a3a !important; }
  }
}

.op-divider {
  display: inline-block;
  width: 1px;
  height: 14px;
  background: #e8e3dc;
  margin: 0 10px;
  vertical-align: middle;
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
  }

  .el-table__body tr:hover > td {
    background: #fdf6e8;
  }
}

/* ===== 主按钮 ===== */
:deep(.el-button--primary) {
  --el-button-bg-color: #8B6914;
  --el-button-border-color: #8B6914;
  --el-button-hover-bg-color: #a68b3c;
  --el-button-hover-border-color: #a68b3c;
  --el-button-active-bg-color: #7a5b11;
  --el-button-active-border-color: #7a5b11;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/* ===== 默认按钮（取消等） ===== */
:deep(.el-button:not(.el-button--primary)) {
  --el-button-border-color: #e8e3dc;
  --el-button-text-color: #8c8170;
  --el-button-hover-border-color: #b8af9e;
  --el-button-hover-text-color: #2c2416;
  --el-button-bg-color: #fff;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/* ===== 输入框 ===== */
:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e8e3dc;
  box-shadow: 0 0 0 1px #e8e3dc inset;
  transition: all 0.2s ease;

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

:deep(.el-input-number) {
  .el-input__wrapper {
    border-radius: 8px;
    border-color: #e8e3dc;
    box-shadow: 0 0 0 1px #e8e3dc inset;
  }
}

.sort-input {
  width: 160px;
}

/* ===== 弹窗 ===== */
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

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #f0ece5;
  }
}

/* ===== 表单 ===== */
.cat-form {
  :deep(.el-form-item__label) {
    font-size: 14px;
    font-weight: 500;
    color: #2c2416;
    justify-content: flex-start;
  }
}

/* 弹窗底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  min-width: 80px;
}

.confirm-btn {
  min-width: 80px;
}
</style>

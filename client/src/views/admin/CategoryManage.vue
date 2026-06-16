<template>
  <div class="category-manage">
    <div class="toolbar">
      <div class="section-title">分类管理</div>
      <el-button type="primary" class="add-btn" @click="openDialog()">新增分类</el-button>
    </div>

    <div class="table-card">
      <el-table :data="list" stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" min-width="160" />
        <el-table-column label="父级分类" width="150">
          <template #default="{ row }">
            <span :class="{ 'parent-none': !parentName(row.parent_id) }">
              {{ parentName(row.parent_id) || '无' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button type="primary" link size="small" class="edit-btn" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" class="delete-btn" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="form.parent_id" placeholder="请选择父级分类（可选）" clearable style="width:100%;">
            <el-option label="无" :value="null" />
            <el-option
              v-for="c in parentOptions"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" class="sort-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="cancel-btn" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" class="confirm-btn" @click="handleSave">确定</el-button>
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

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
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

onMounted(fetchList)
</script>

<style lang="scss" scoped>
.category-manage {
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c2416;
}

.add-btn {
  height: 38px;
  padding: 0 20px;
  font-weight: 500;
}

.table-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  overflow: hidden;
}

.parent-none {
  color: #b8af9e;
}

.sort-input {
  width: 160px;
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

/* 默认按钮 */
:deep(.el-button:not(.el-button--primary)) {
  --el-button-border-color: #e8e3dc;
  --el-button-text-color: #8c8170;
  --el-button-hover-border-color: #b8af9e;
  --el-button-hover-text-color: #2c2416;
  --el-button-bg-color: #fff;
  border-radius: 8px;
}

/* 链接按钮 - 编辑 */
:deep(.edit-btn) {
  color: #8B6914 !important;

  &:hover {
    color: #a68b3c !important;
  }
}

/* 链接按钮 - 删除 */
:deep(.delete-btn) {
  color: #c0392b !important;

  &:hover {
    color: #d94a3a !important;
  }
}

/* 对话框 */
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
    border-top: 1px solid #f0ece5;
    padding: 16px 24px;
  }
}

/* 对话框内表单 */
:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #2c2416;
  padding-bottom: 8px;
}

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

:deep(.el-input-number) {
  .el-input__wrapper {
    border-radius: 8px;
    border-color: #e8e3dc;
    box-shadow: 0 0 0 1px #e8e3dc inset;
  }
}
</style>

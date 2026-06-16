<template>
  <div class="category-manage">
    <div class="toolbar">
      <h3 style="margin:0;">分类管理</h3>
      <el-button type="primary" @click="openDialog()">新增分类</el-button>
    </div>

    <el-table :data="list" stripe v-loading="loading" style="margin-top:16px;">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column label="父级分类" width="150">
        <template #default="{ row }">
          {{ parentName(row.parent_id) || '无' }}
        </template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="80" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
          <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑分类' : '新增分类'" width="480px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父级分类">
          <el-select v-model="form.parent_id" placeholder="请选择父级分类（可选）" clearable style="width:100%;">
            <el-option
              v-for="c in parentOptions"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="0" style="width:160px;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">确定</el-button>
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
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

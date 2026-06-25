<template>
  <div class="product-form">
    <div class="form-card">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" size="default">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>

        <el-form-item label="分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择分类" style="width:100%;">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="价格" prop="price">
          <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" class="number-input" />
        </el-form-item>

        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="form.stock" :min="0" :step="1" class="number-input" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入商品描述" />
        </el-form-item>

        <el-form-item label="主图">
          <el-upload
            class="main-upload"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleMainImageChange"
            accept="image/*"
          >
            <img
              v-if="form.main_image"
              :src="form.main_image.startsWith('/uploads') ? form.main_image : '/uploads/' + form.main_image"
              class="main-image-preview"
            />
            <div v-else class="main-upload-placeholder">
              <el-icon :size="28" class="upload-icon"><Plus /></el-icon>
              <span class="upload-hint">点击上传</span>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="多图">
          <el-upload
            v-model:file-list="imageFiles"
            :auto-upload="false"
            list-type="picture-card"
            :limit="5"
            accept="image/*"
            :on-change="handleImageChange"
            :on-exceed="handleExceed"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
          >
            <el-icon :size="20"><Plus /></el-icon>
          </el-upload>
          <el-dialog v-model="previewVisible" title="图片预览" width="600px">
            <img :src="previewUrl" style="width:100%;border-radius:8px;" />
          </el-dialog>
        </el-form-item>

        <el-form-item label="上架状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" class="warm-switch" />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button class="cancel-btn" @click="$router.back()">取消</el-button>
            <el-button type="primary" :loading="submitting" class="save-btn" @click="handleSave">保存</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import * as adminApi from '@/api/admin'
import { getCategories, getProductDetail } from '@/api/product'
import { uploadFile } from '@/api/user'

const route = useRoute()
const router = useRouter()

const id = route.params.id
const isEdit = !!id

const formRef = ref(null)
const submitting = ref(false)
const categories = ref([])
const imageFiles = ref([])
const previewVisible = ref(false)
const previewUrl = ref('')

const form = reactive({
  name: '',
  category_id: null,
  price: 0,
  stock: 0,
  description: '',
  main_image: '',
  images: [],
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

async function uploadOne(file) {
  const data = await uploadFile(file.raw)
  return data.url || data.path || data
}

async function handleMainImageChange(file) {
  try {
    const url = await uploadOne(file)
    form.main_image = url
    ElMessage.success('主图上传成功')
  } catch {
    ElMessage.error('主图上传失败')
  }
}

async function handleImageChange(file) {
  try {
    const url = await uploadOne(file)
    form.images.push(url)
  } catch {
    ElMessage.error('图片上传失败')
  }
}

function handleExceed() {
  ElMessage.warning('最多上传5张图片')
}

function handlePreview(file) {
  previewUrl.value = file.url || file.response?.url || ''
  previewVisible.value = true
}

function handleRemove(file) {
  const idx = imageFiles.value.findIndex(f => f.uid === file.uid)
  if (idx > -1) {
    form.images.splice(idx, 1)
  }
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit) {
      await adminApi.adminUpdateProduct(id, { ...form })
      ElMessage.success('更新成功')
    } else {
      await adminApi.adminCreateProduct({ ...form })
      ElMessage.success('新增成功')
    }
    router.push('/admin/products')
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const cats = await getCategories()
    categories.value = cats || []
  } catch { /* ignore */ }

  if (isEdit) {
    try {
      const detail = await getProductDetail(id)
      form.name = detail.name || ''
      form.category_id = detail.category_id || null
      form.price = detail.price || 0
      form.stock = detail.stock || 0
      form.description = detail.description || ''
      form.main_image = detail.main_image || ''
      form.images = detail.images || []
      form.status = detail.status ?? 1
      imageFiles.value = (detail.images || []).map((url, i) => ({
        uid: i,
        name: `image-${i}`,
        url
      }))
    } catch { /* ignore */ }
  }
})
</script>

<style lang="scss" scoped>
.product-form {
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

/* ====== 表单卡片 ====== */
.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px 48px;
  border: 1px solid #f0ece5;
  box-shadow: 0 1px 4px rgba(44, 36, 22, 0.04);
  width: 100%;
  max-width: 720px;
}

/* ====== 表单项间距 ====== */
:deep(.el-form-item) {
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #2c2416;
  padding-bottom: 6px;
}

/* ====== 数字输入 ====== */
.number-input {
  width: 200px;
}

/* ====== 主图上传 ====== */
.main-upload {
  :deep(.el-upload) {
    border: 2px dashed #e8e3dc;
    border-radius: 12px;
    cursor: pointer;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s ease;
    overflow: hidden;

    &:hover {
      border-color: #8B6914;
      border-style: solid;
    }
  }
}

.main-upload-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;

  .upload-icon {
    color: #b8af9e;
  }

  .upload-hint {
    font-size: 12px;
    color: #b8af9e;
  }
}

.main-image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.25s ease;

  &:hover {
    transform: scale(1.05);
  }
}

/* ====== 按钮区 ====== */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  width: 100%;
}

.save-btn {
  height: 42px;
  padding: 0 36px;
  font-size: 14px;
  font-weight: 500;
  min-width: 140px;
}

.cancel-btn {
  height: 42px;
  padding: 0 24px;
  font-size: 14px;
}

/* ====== 输入框/选择器覆盖 ====== */
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

:deep(.el-textarea__inner) {
  border-radius: 8px;
  border-color: #e8e3dc;
  transition: border-color 0.25s ease;

  &:focus {
    border-color: #8B6914;
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

/* ====== 默认按钮(取消) ====== */
:deep(.el-button:not(.el-button--primary)) {
  --el-button-border-color: #e8e3dc;
  --el-button-text-color: #8c8170;
  --el-button-hover-border-color: #b8af9e;
  --el-button-hover-text-color: #2c2416;
  --el-button-bg-color: #fff;
  border-radius: 8px;
}

/* ====== 上传列表项 ====== */
:deep(.el-upload-list--picture-card) {
  .el-upload-list__item {
    border-radius: 8px;
    border: 1px solid #e8e3dc;
    transition: border-color 0.25s ease;

    &:hover {
      border-color: #8B6914;
    }
  }

  .el-upload-list__item-thumbnail {
    border-radius: 6px;
  }
}

/* ====== 上传按钮区域 ====== */
:deep(.el-upload--picture-card) {
  border-radius: 10px;
  border: 2px dashed #e8e3dc;
  background: transparent;
  transition: all 0.25s ease;

  &:hover {
    border-color: #8B6914;
    border-style: solid;
    color: #8B6914;
  }
}

/* ====== 开关 ====== */
:deep(.warm-switch) {
  --el-switch-on-color: #5b8c5a;
  --el-switch-off-color: #b8af9e;
}
</style>

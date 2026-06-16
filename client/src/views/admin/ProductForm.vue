<template>
  <div class="product-form">
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
        <el-input-number v-model="form.price" :min="0" :precision="2" :step="10" style="width:200px;" />
      </el-form-item>

      <el-form-item label="库存" prop="stock">
        <el-input-number v-model="form.stock" :min="0" :step="1" style="width:200px;" />
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
          <img v-if="form.main_image" :src="form.main_image" class="main-image-preview" />
          <el-icon v-else class="main-upload-icon"><Plus /></el-icon>
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
          <el-icon><Plus /></el-icon>
        </el-upload>
        <el-dialog v-model="previewVisible" title="图片预览" width="600px">
          <img :src="previewUrl" style="width:100%;" />
        </el-dialog>
      </el-form-item>

      <el-form-item label="上架状态">
        <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSave">保存</el-button>
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
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
  max-width: 720px;
}

.main-upload {
  .main-upload-icon {
    font-size: 28px;
    color: #c0c4cc;
  }

  .main-image-preview {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px dashed #dcdfe6;
  }

  .el-upload {
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    cursor: pointer;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #409eff;
    }
  }
}
</style>

<template>
  <div class="user-profile-page">
    <div class="container">
      <h2 class="page-title">个人中心</h2>

      <el-tabs v-model="activeTab" class="profile-tabs">
        <el-tab-pane label="个人信息" name="info">
          <div class="tab-content">
            <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="80px" class="profile-form">
              <el-form-item label="用户名">
                <el-input :value="auth.user?.username" disabled />
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="profileSaving" @click="saveProfile">保存修改</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="收货地址" name="address">
          <div class="tab-content">
            <div class="address-actions">
              <el-button type="primary" @click="openAddrDialog()">
                <el-icon><Plus /></el-icon> 新增地址
              </el-button>
            </div>
            <div v-loading="addrLoading" class="address-grid">
              <div v-if="addresses.length === 0" class="empty-hint">暂无收货地址</div>
              <div v-for="addr in addresses" :key="addr.id" class="addr-card">
                <div class="addr-card-header">
                  <span class="addr-name">{{ addr.consignee }}</span>
                  <span class="addr-phone">{{ addr.phone }}</span>
                </div>
                <div class="addr-detail">
                  {{ addr.province }}{{ addr.city }}{{ addr.district }} {{ addr.detail }}
                </div>
                <div class="addr-tags">
                  <el-tag v-if="addr.isDefault" size="small" class="default-tag">默认地址</el-tag>
                </div>
                <div class="addr-actions">
                  <el-button size="small" text @click="openAddrDialog(addr)">编辑</el-button>
                  <el-popconfirm title="确认删除该地址？" @confirm="deleteAddress(addr.id)">
                    <template #reference>
                      <el-button size="small" text class="btn-delete">删除</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 地址弹窗 -->
    <el-dialog v-model="addrDialogVisible" :title="editingAddr ? '编辑地址' : '新增地址'" width="520px" destroy-on-close>
      <el-form ref="addrFormRef" :model="addrForm" :rules="addrRules" label-width="80px">
        <el-form-item label="收货人" prop="consignee">
          <el-input v-model="addrForm.consignee" placeholder="请输入收货人" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addrForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="省/市/区" required>
          <el-row :gutter="10">
            <el-col :span="8">
              <el-input v-model="addrForm.province" placeholder="省" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="addrForm.city" placeholder="市" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="addrForm.district" placeholder="区" />
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="详细地址" prop="detail">
          <el-input v-model="addrForm.detail" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="设为默认">
          <el-switch v-model="addrForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addrDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="addrSaving" @click="saveAddr">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import * as userApi from '@/api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()
const auth = useAuthStore()
const activeTab = ref('info')

// 如果未登录跳转
if (!auth.isLoggedIn) {
  router.push({ path: '/login', query: { redirect: '/user' } })
}

// ---- 个人信息 ----
const profileFormRef = ref(null)
const profileSaving = ref(false)
const profileForm = reactive({
  nickname: auth.user?.nickname || '',
  phone: auth.user?.phone || ''
})

const profileRules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

async function saveProfile() {
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) return
  profileSaving.value = true
  try {
    const updated = await userApi.updateProfile({ ...profileForm })
    auth.user.value = { ...auth.user, ...updated }
    localStorage.setItem('user', JSON.stringify(auth.user))
    ElMessage.success('个人信息已更新')
  } catch {
    ElMessage.error('更新失败')
  } finally {
    profileSaving.value = false
  }
}

// ---- 地址管理 ----
const addresses = ref([])
const addrLoading = ref(false)
const addrDialogVisible = ref(false)
const addrSaving = ref(false)
const editingAddr = ref(null)
const addrFormRef = ref(null)

const addrForm = reactive({
  consignee: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const addrRules = {
  consignee: [{ required: true, message: '请输入收货人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  detail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
}

async function fetchAddresses() {
  addrLoading.value = true
  try {
    addresses.value = await userApi.getAddresses()
  } finally {
    addrLoading.value = false
  }
}

function openAddrDialog(addr = null) {
  editingAddr.value = addr
  if (addr) {
    Object.assign(addrForm, {
      consignee: addr.consignee,
      phone: addr.phone,
      province: addr.province || '',
      city: addr.city || '',
      district: addr.district || '',
      detail: addr.detail,
      isDefault: !!addr.isDefault
    })
  } else {
    Object.assign(addrForm, { consignee: '', phone: '', province: '', city: '', district: '', detail: '', isDefault: false })
  }
  addrDialogVisible.value = true
}

async function saveAddr() {
  const valid = await addrFormRef.value.validate().catch(() => false)
  if (!valid) return
  addrSaving.value = true
  try {
    if (editingAddr.value) {
      await userApi.updateAddress(editingAddr.value.id, { ...addrForm })
      ElMessage.success('地址已更新')
    } else {
      await userApi.addAddress({ ...addrForm })
      ElMessage.success('地址已添加')
    }
    addrDialogVisible.value = false
    await fetchAddresses()
  } catch {
    ElMessage.error('操作失败')
  } finally {
    addrSaving.value = false
  }
}

async function deleteAddress(id) {
  try {
    await userApi.deleteAddress(id)
    ElMessage.success('地址已删除')
    await fetchAddresses()
  } catch {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  fetchAddresses()
})
</script>

<style lang="scss" scoped>
.user-profile-page {
  .container {
    max-width: 860px;
    margin: 0 auto;
    padding: 28px 24px 80px;
  }
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c2416;
  margin: 0 0 32px 0;
  position: relative;
  padding-bottom: 12px;
  letter-spacing: -0.02em;
  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 40px;
    height: 3px;
    background: #8B6914;
    border-radius: 1.5px;
  }
}

.profile-tabs {
  background: #fff;
  border-radius: 12px;
  padding: 24px 28px;
  border: 1px solid #f0ece5;

  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    background-color: #f0ece5;
  }

  :deep(.el-tabs__item) {
    color: #8c8170;
    font-size: 15px;
    letter-spacing: 0.02em;
    &:hover {
      color: #8B6914;
    }
    &.is-active {
      color: #8B6914;
      font-weight: 600;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: #8B6914;
  }
}

.tab-content { min-height: 300px; }

.profile-form { max-width: 420px; margin-top: 12px; }

.address-actions { margin-bottom: 18px; }

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.empty-hint { color: #b8af9e; text-align: center; padding: 40px 0; grid-column: 1 / -1; }

.addr-card {
  border: 1px solid #f0ece5;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  background: #fff;

  &:hover {
    box-shadow: 0 4px 16px rgba(44, 36, 22, 0.08);
    transform: translateY(-2px);
  }
}

.addr-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.addr-name { font-weight: 600; color: #2c2416; }
.addr-phone { color: #8c8170; font-size: 13px; letter-spacing: 0.02em; }
.addr-detail { color: #8c8170; font-size: 13px; margin-bottom: 10px; line-height: 1.5; letter-spacing: 0.02em; }
.addr-tags { margin-bottom: 12px; }

.default-tag {
  background: #fdf6e8;
  color: #8B6914;
  border-color: #f0ece5;
}

.addr-actions {
  display: flex;
  gap: 4px;
  :deep(.el-button.is-text) {
    color: #8B6914;
    &:hover {
      color: #a68b3c;
    }
  }
  .btn-delete {
    color: #c0392b !important;
    &:hover {
      color: #e74c3c !important;
    }
  }
}

:deep(.el-button--primary) {
  background: #8B6914;
  border-color: #8B6914;
  border-radius: 8px;
  &:hover {
    background: #a68b3c;
    border-color: #a68b3c;
  }
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e8e3dc;
  &:hover {
    box-shadow: 0 0 0 1px #c0b9a8;
  }
  &.is-focus {
    box-shadow: 0 0 0 1px #8B6914;
  }
}

:deep(.el-dialog) {
  border-radius: 12px;
}
</style>

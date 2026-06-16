<template>
  <div class="admin-login">
    <div class="login-card">
      <h2 class="login-title">拓肯管理后台</h2>
      <p class="login-subtitle">专业的家居电商管理平台</p>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await auth.adminLogin({ username: form.username, password: form.password })
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/admin'
    router.push(redirect)
  } catch {
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.admin-login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #faf8f5;
  font-family: system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.login-card {
  width: 400px;
  padding: 48px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 4px 24px rgba(44, 36, 22, 0.06);
}

.login-title {
  text-align: center;
  font-size: 22px;
  color: #2c2416;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.login-subtitle {
  text-align: center;
  font-size: 13px;
  color: #b8af9e;
  margin: 0 0 32px 0;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  letter-spacing: 0.08em;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  border-color: #e8e3dc;
  box-shadow: 0 0 0 1px #e8e3dc inset;

  &:hover {
    border-color: #a68b3c;
  }
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #8B6914;
  box-shadow: 0 0 0 1px #8B6914 inset;
}

:deep(.el-button--primary) {
  --el-button-bg-color: #8B6914;
  --el-button-border-color: #8B6914;
  --el-button-hover-bg-color: #a68b3c;
  --el-button-hover-border-color: #a68b3c;
  --el-button-active-bg-color: #7a5b11;
  --el-button-active-border-color: #7a5b11;
  border-radius: 8px;
}
</style>

<template>
  <div class="admin-login">
    <div class="login-card">
      <!-- Logo 区 -->
      <div class="logo-area">
        <div class="logo-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#faf8f5" stroke="#f0ece5" stroke-width="1.5"/>
            <path d="M14 18h20M14 24h16M14 30h12" stroke="#8B6914" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="36" cy="30" r="4" fill="#c17817"/>
          </svg>
        </div>
        <h1 class="logo-title">拓肯</h1>
        <p class="logo-subtitle">管理后台</p>
      </div>

      <!-- 表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item class="login-form-item">
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部装饰 -->
      <div class="card-footer-dots">
        <span class="dot" v-for="n in 3" :key="n"></span>
      </div>
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
  max-width: 90vw;
  padding: 48px 48px 36px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0ece5;
  box-shadow: 0 2px 16px rgba(44, 36, 22, 0.06), 0 8px 32px rgba(44, 36, 22, 0.04);
}

/* ===== Logo 区 ===== */
.logo-area {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  margin-bottom: 16px;

  svg {
    display: inline-block;
    vertical-align: middle;
  }
}

.logo-title {
  font-size: 28px;
  font-weight: 700;
  color: #2c2416;
  margin: 0 0 6px 0;
  letter-spacing: 0.06em;
}

.logo-subtitle {
  font-size: 14px;
  color: #b8af9e;
  margin: 0;
  font-weight: 400;
}

/* ===== 表单 ===== */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form-item {
  margin-bottom: 0 !important;
  margin-top: 28px;
}

:deep(.el-input__wrapper) {
  height: 44px;
  border-radius: 8px;
  border-color: #e8e3dc;
  box-shadow: 0 0 0 1px #e8e3dc inset;
  padding: 0 16px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #a68b3c;
  }

  &.is-focus {
    border-color: #8B6914;
    box-shadow: 0 0 0 1px #8B6914 inset;
  }
}

:deep(.el-input__inner) {
  font-size: 14px;
  color: #2c2416;

  &::placeholder {
    color: #b8af9e;
  }
}

/* ===== 登录按钮 ===== */
.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.08em;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
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

/* ===== 底部装饰点 ===== */
.card-footer-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 32px;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e8e3dc;
    transition: background 0.2s ease;

    &:nth-child(2) {
      background: #c17817;
    }
  }
}
</style>

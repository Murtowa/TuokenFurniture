<template>
  <div class="login-page">
    <div class="login-card">
      <h2 class="card-title">欢迎登录拓肯家具</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large" @submit.prevent="handleLogin">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width:100%;" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="card-footer">
        <span class="footer-text">还没有账号？</span>
        <router-link to="/register">去注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()

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
    await auth.login({ username: form.username, password: form.password })
    await cart.mergeLocal()
    ElMessage.success('登录成功')
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch {
    ElMessage.error('登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #faf8f5;
}

.login-card {
  width: 420px;
  max-width: 90vw;
  padding: 48px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 4px 24px rgba(44, 36, 22, 0.06);
}

.card-title {
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #2c2416;
  margin: 0 0 36px 0;
  letter-spacing: -0.02em;
}

.card-footer {
  text-align: center;
  margin-top: 8px;

  .footer-text {
    color: #8c8170;
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  a {
    color: #8B6914;
    font-size: 14px;
    text-decoration: none;
    letter-spacing: 0.02em;

    &:hover {
      color: #a68b3c;
    }
  }
}

:deep(.el-input .el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e8e3dc;
}

:deep(.el-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0b9a8;
}

:deep(.el-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #8B6914;
}

:deep(.el-button--primary) {
  border-radius: 8px;
  background: #8B6914;
  border-color: #8B6914;

  &:hover {
    background: #a68b3c;
    border-color: #a68b3c;
  }
}
</style>

<template>
  <div class="register-page">
    <div class="register-card">
      <h2 class="card-title">注册拓肯家具账号</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large" @submit.prevent="handleRegister">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" prefix-icon="Notebook" />
        </el-form-item>
        <el-form-item prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" prefix-icon="Phone" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" style="width:100%;" @click="handleRegister">
            注 册
          </el-button>
        </el-form-item>
      </el-form>
      <div class="card-footer">
        <span class="footer-text">已有账号？</span>
        <router-link to="/login">去登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

async function handleRegister() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await auth.register({
      username: form.username,
      nickname: form.nickname,
      phone: form.phone,
      password: form.password
    })
    ElMessage.success('注册成功')
    router.push('/')
  } catch (err) {
    const msg = err?.response?.data?.message || '注册失败，请稍后重试'
    ElMessage.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #faf8f5;
}

.register-card {
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

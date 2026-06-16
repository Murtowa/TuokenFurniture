<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-code">404</div>
      <p class="error-desc">抱歉，您访问的页面不存在</p>
      <el-button type="primary" size="large" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #faf8f5;
}

.error-card {
  text-align: center;
  padding: 60px 40px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0ece5;
  box-shadow: 0 4px 24px rgba(44, 36, 22, 0.06);
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  color: #8c8170;
  line-height: 1.2;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.error-desc {
  font-size: 16px;
  color: #b8af9e;
  margin: 0 0 32px 0;
  letter-spacing: 0.02em;
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

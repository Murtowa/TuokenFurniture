<template>
  <div class="error-page">
    <div class="error-card">
      <div class="error-code">403</div>
      <p class="error-desc">抱歉，您没有权限访问此页面</p>
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
  background: #f5f0eb;
}

.error-card {
  text-align: center;
  padding: 60px 40px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.error-code {
  font-size: 96px;
  font-weight: 700;
  color: #e6a23c;
  line-height: 1.2;
  margin-bottom: 16px;
}

.error-desc {
  font-size: 16px;
  color: #909399;
  margin: 0 0 32px 0;
}
</style>

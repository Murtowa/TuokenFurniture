<template>
  <div class="layout-admin">
    <aside class="admin-sidebar">
      <div class="sidebar-logo">拓肯管理</div>
      <el-menu :default-active="route.path" router>
        <el-menu-item index="/admin">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><FolderOpened /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
      <div style="flex:1" />
      <div class="sidebar-footer">
        <el-button text style="color:#a09888;width:100%;" @click="doLogout">
          <el-icon><SwitchButton /></el-icon>
          <span style="margin-left:8px;">退出登录</span>
        </el-button>
      </div>
    </aside>
    <div class="admin-main">
      <header class="admin-header">
        <span>{{ pageTitle }}</span>
        <el-dropdown trigger="click" placement="bottom-end">
          <span class="admin-user-trigger">{{ auth.user?.nickname || '管理员' }}</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="doLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { DataAnalysis, Goods, FolderOpened, Document, User, SwitchButton } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const titleMap = {
  '/admin': '仪表盘',
  '/admin/products': '商品管理',
  '/admin/categories': '分类管理',
  '/admin/orders': '订单管理',
  '/admin/users': '用户管理'
}
const pageTitle = computed(() => titleMap[route.path] || '管理后台')

function doLogout() {
  auth.logout()
  router.push('/admin/login')
}
</script>

<style lang="scss" scoped>
.sidebar-footer {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 12px;
}
.admin-user-trigger {
  cursor: pointer;
  color: #8c8170;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover { color: #2c2416; background: #fdf6e8; }
}
</style>

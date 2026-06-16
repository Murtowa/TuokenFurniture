<template>
  <div class="layout-client">
    <header class="header">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/')">拓肯家具</div>
        <nav class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/products">商品列表</router-link>
          <router-link to="/cart">购物车</router-link>
          <template v-if="auth.isLoggedIn">
            <router-link to="/user">个人中心</router-link>
          </template>
        </nav>
        <div class="header-actions">
          <div class="cart-btn" @click="$router.push('/cart')">
            <el-icon :size="22"><ShoppingCart /></el-icon>
            <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>
          <template v-if="auth.isLoggedIn">
            <el-dropdown>
              <span style="cursor:pointer;color:#555;">{{ auth.user?.nickname || auth.user?.username }}</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/user')">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/orders')">我的订单</el-dropdown-item>
                  <el-dropdown-item @click="doLogout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button size="small" @click="$router.push('/login')">登录</el-button>
            <el-button size="small" type="primary" @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <div class="page-wrapper">
      <router-view />
    </div>

    <footer class="footer">
      <p>拓肯家具 &copy; 2026 — 品质家居生活</p>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const cartCount = computed(() => cart.items.length)

function doLogout() {
  auth.logout()
  cart.clearLocal()
  router.push('/')
}

onMounted(() => {
  cart.fetch()
})
</script>

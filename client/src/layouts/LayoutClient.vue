<template>
  <div class="layout-client">
    <header class="header" :class="{ 'header-scrolled': scrolled }">
      <div class="header-inner">
        <div class="logo" @click="$router.push('/')">拓肯</div>
        <nav class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/products">全部商品</router-link>
          <router-link to="/cart">购物车</router-link>
          <router-link v-if="auth.isLoggedIn" to="/user/orders">我的订单</router-link>
        </nav>
        <div class="header-actions">
          <div class="cart-btn" @click="$router.push('/cart')">
            <el-icon :size="20"><ShoppingCart /></el-icon>
            <span v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</span>
          </div>
          <template v-if="auth.isLoggedIn">
            <el-dropdown trigger="click" placement="bottom-end">
              <span class="user-trigger">{{ auth.user?.nickname || auth.user?.username }}</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/user')">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="$router.push('/user/orders')">我的订单</el-dropdown-item>
                  <el-dropdown-item divided @click="doLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button text @click="$router.push('/login')">登录</el-button>
            <el-button @click="$router.push('/register')">注册</el-button>
          </template>
        </div>
      </div>
    </header>

    <div class="page-wrapper">
      <router-view v-slot="{ Component }">
        <transition name="fade-page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <footer class="footer">
      <div class="footer-inner">
        <span class="footer-brand">拓肯家具</span>
        <div class="footer-links">
          <a href="#">关于我们</a>
          <a href="#">配送说明</a>
          <a href="#">售后服务</a>
          <a href="#">联系我们</a>
        </div>
        <span style="color:#6b6355;font-size:13px;">&copy; 2026 Tuoken Furniture</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()

const scrolled = ref(false)
const cartCount = computed(() => {
  if (!cart.items) return 0
  return cart.items.reduce((sum, i) => sum + (i.quantity || 1), 0)
})

function onScroll() { scrolled.value = window.scrollY > 20 }
function doLogout() {
  auth.logout()
  cart.clearLocal()
  router.push('/')
}

onMounted(() => {
  cart.fetch()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onUnmounted(() => { window.removeEventListener('scroll', onScroll) })
</script>

<style lang="scss" scoped>
.user-trigger {
  cursor: pointer;
  color: #8c8170;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover { color: #2c2416; background: #fdf6e8; }
}

.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

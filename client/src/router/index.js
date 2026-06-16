import { createRouter, createWebHistory } from 'vue-router'
import clientRoutes from './client'
import adminRoutes from './admin'

const routes = [
  ...clientRoutes,
  ...adminRoutes,
  { path: '/403', name: 'Forbidden', component: () => import('@/views/client/Error403.vue') },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/client/Error404.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  if (to.meta.requiresAuth && !token) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }

  if (to.path.startsWith('/admin') && to.path !== '/admin/login') {
    if (!token) {
      return next({ path: '/admin/login', query: { redirect: to.fullPath } })
    }
    if (user && user.role !== 'admin') {
      return next({ path: '/403' })
    }
  }

  next()
})

export default router

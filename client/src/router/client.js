export default [
  {
    path: '/',
    component: () => import('@/layouts/LayoutClient.vue'),
    children: [
      { path: '', name: 'Home', component: () => import('@/views/client/Home.vue') },
      { path: 'products', name: 'ProductList', component: () => import('@/views/client/ProductList.vue') },
      { path: 'product/:id', name: 'ProductDetail', component: () => import('@/views/client/ProductDetail.vue') },
      { path: 'cart', name: 'Cart', component: () => import('@/views/client/Cart.vue') },
      { path: 'checkout', name: 'Checkout', component: () => import('@/views/client/Checkout.vue'), meta: { requiresAuth: true } },
      { path: 'login', name: 'Login', component: () => import('@/views/client/Login.vue') },
      { path: 'register', name: 'Register', component: () => import('@/views/client/Register.vue') },
      { path: 'user', name: 'UserProfile', component: () => import('@/views/client/UserProfile.vue'), meta: { requiresAuth: true } },
      { path: 'user/orders', name: 'UserOrders', component: () => import('@/views/client/UserOrders.vue'), meta: { requiresAuth: true } }
    ]
  }
]

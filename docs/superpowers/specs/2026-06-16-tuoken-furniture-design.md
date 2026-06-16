# 拓肯家具电商平台 — 设计规格

> **日期**: 2026-06-16  
> **类型**: 学习项目  
> **技术栈**: Vue 3 + Vite + Pinia + Element-Plus + SCSS + Axios + Echarts / Node.js + Express + MySQL

---

## 1. 概述

### 1.1 项目定位

全栈学习项目，目标是构建一个功能完整的家具电商平台，涵盖前台商品浏览/购买和后台管理/统计。

### 1.2 模块范围

| 模块 | 说明 |
|------|------|
| 商品展示 | 首页、商品列表、分类筛选、搜索、商品详情 |
| 用户系统 | 注册、登录、个人中心、收货地址管理 |
| 购物交易 | 购物车、下单、订单管理、状态流转 |
| 管理后台 | 仪表盘、商品管理、分类管理、订单管理、用户管理 |

### 1.3 约束

- 图片存储：本地 `server/uploads/` 目录
- 支付：模拟支付，后台手动流转订单状态
- 商品模型：基础属性（名称、价格、图片、分类、描述、库存）
- 项目结构：单体项目（前端单入口 + 角色路由）

---

## 2. 项目结构

```
tuoken-furniture/
├── client/                    # Vue 3 前端
│   ├── public/
│   ├── src/
│   │   ├── api/               # Axios 接口封装
│   │   ├── assets/            # 静态资源
│   │   ├── components/        # 通用组件
│   │   │   ├── client/        #   前台组件
│   │   │   └── admin/         #   后台组件
│   │   ├── layouts/
│   │   │   ├── LayoutClient.vue   # 前台壳（Header + 内容 + Footer）
│   │   │   └── LayoutAdmin.vue    # 后台壳（Sidebar + Header + 内容）
│   │   ├── router/
│   │   │   ├── index.js       # 路由入口
│   │   │   ├── client.js      # 前台路由
│   │   │   └── admin.js       # 后台路由
│   │   ├── stores/            # Pinia 状态管理
│   │   │   ├── auth.js
│   │   │   ├── cart.js
│   │   │   ├── product.js
│   │   │   ├── order.js
│   │   │   └── admin/
│   │   ├── styles/            # SCSS 全局样式
│   │   ├── utils/             # 工具函数
│   │   ├── views/
│   │   │   ├── client/        # 前台页面
│   │   │   │   ├── Home.vue
│   │   │   │   ├── ProductList.vue
│   │   │   │   ├── ProductDetail.vue
│   │   │   │   ├── Cart.vue
│   │   │   │   ├── Checkout.vue
│   │   │   │   ├── Login.vue
│   │   │   │   ├── Register.vue
│   │   │   │   ├── UserProfile.vue
│   │   │   │   └── UserOrders.vue
│   │   │   └── admin/
│   │   │       ├── Dashboard.vue
│   │   │       ├── ProductManage.vue
│   │   │       ├── ProductForm.vue
│   │   │       ├── CategoryManage.vue
│   │   │       ├── OrderManage.vue
│   │   │       ├── UserManage.vue
│   │   │       └── AdminLogin.vue
│   │   ├── App.vue
│   │   └── main.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Express 后端
│   ├── config/
│   │   └── db.js              # MySQL 连接配置
│   ├── middleware/
│   │   ├── auth.js            # JWT 验证中间件
│   │   ├── adminAuth.js       # 管理员权限验证
│   │   └── errorHandler.js    # 全局错误处理
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── user.js
│   │   ├── admin/
│   │   │   ├── dashboard.js
│   │   │   ├── products.js
│   │   │   ├── categories.js
│   │   │   ├── orders.js
│   │   │   └── users.js
│   │   └── upload.js
│   ├── models/                # SQL 查询封装
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── category.js
│   │   ├── cart.js
│   │   ├── order.js
│   │   ├── address.js
│   │   └── admin.js
│   ├── utils/
│   │   ├── jwt.js             # JWT 签发与验证
│   │   └── response.js        # 统一响应格式
│   ├── uploads/               # 上传图片目录（gitignore）
│   ├── app.js                 # Express 入口
│   └── package.json
│
└── docs/
    └── superpowers/
        └── specs/             # 设计规格文档
```

---

## 3. 数据库设计

### 3.1 表关系

```
users ──────< addresses        (1对多)
users ──────< orders            (1对多)
orders ──────< order_items      (1对多)
products ────< order_items      (1对多)
categories ──< products         (1对多)
categories ──< categories       (自引用，parent_id)
```

### 3.2 表结构

**users — 用户**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| username | VARCHAR(50) UNIQUE | 用户名 |
| password | VARCHAR(255) | 加密后的密码 |
| nickname | VARCHAR(50) | 昵称 |
| phone | VARCHAR(20) | |
| avatar | VARCHAR(255) | 头像路径 |
| status | TINYINT DEFAULT 1 | 1启用/0禁用 |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME ON UPDATE CURRENT_TIMESTAMP | |

**admin_users — 管理员**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| username | VARCHAR(50) UNIQUE | |
| password | VARCHAR(255) | |
| nickname | VARCHAR(50) | |
| role | VARCHAR(20) DEFAULT 'admin' | |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | |

**addresses — 收货地址**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| user_id | INT FK → users | |
| receiver_name | VARCHAR(50) | 收货人 |
| phone | VARCHAR(20) | |
| province | VARCHAR(50) | |
| city | VARCHAR(50) | |
| district | VARCHAR(50) | |
| detail | VARCHAR(255) | 详细地址 |
| is_default | TINYINT DEFAULT 0 | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**banners — 首页轮播**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| image | VARCHAR(255) | 图片路径 |
| link | VARCHAR(255) | 跳转链接（可选） |
| sort_order | INT DEFAULT 0 | 排序 |
| status | TINYINT DEFAULT 1 | 1启用/0禁用 |
| created_at | DATETIME | |

**categories — 商品分类**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| name | VARCHAR(50) | |
| parent_id | INT DEFAULT NULL | 父分类ID（支持二级） |
| sort_order | INT DEFAULT 0 | 排序 |
| icon | VARCHAR(255) | 分类图标 |
| created_at | DATETIME | |

**products — 商品**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| category_id | INT FK → categories | |
| name | VARCHAR(100) | |
| description | TEXT | |
| price | DECIMAL(10,2) | |
| stock | INT DEFAULT 0 | |
| main_image | VARCHAR(255) | 主图路径 |
| images | JSON | 图片数组（最多5张） |
| status | TINYINT DEFAULT 1 | 1上架/0下架 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**cart_items — 购物车**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| user_id | INT FK → users | |
| product_id | INT FK → products | |
| quantity | INT DEFAULT 1 | |
| created_at | DATETIME | |

**orders — 订单**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| order_no | VARCHAR(30) UNIQUE | 订单号 |
| user_id | INT FK → users | |
| address_snapshot | JSON | 地址快照 |
| total_amount | DECIMAL(10,2) | |
| status | ENUM | pending→paid→shipped→completed→cancelled |
| remark | VARCHAR(500) | 备注 |
| paid_at | DATETIME | |
| shipped_at | DATETIME | |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**order_items — 订单明细**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | |
| order_id | INT FK → orders | |
| product_id | INT FK → products | |
| product_snapshot | JSON | 商品快照（名称/价格/图片） |
| quantity | INT | |
| price | DECIMAL(10,2) | 下单时单价 |

---

## 4. API 设计

### 4.1 规范

- 统一前缀：`/api`
- 统一响应：`{ code: 200, message: "ok", data: {} }`
- 认证方式：JWT（Bearer Token）
- 分页参数：`?page=1&pageSize=12`
- 请求体：JSON（POST/PUT）

### 4.2 接口清单

#### 公开接口（无需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/admin-login | 管理员登录 |
| GET | /api/products | 商品列表（分页、筛选、搜索、排序） |
| GET | /api/products/:id | 商品详情 |
| GET | /api/categories | 分类列表（树形结构） |
| GET | /api/banners | 首页轮播图（静态配置或数据库存储） |

#### 用户接口（需 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/user/profile | 个人信息 |
| PUT | /api/user/profile | 更新个人信息 |
| GET | /api/user/addresses | 地址列表 |
| POST | /api/user/addresses | 新增地址 |
| PUT | /api/user/addresses/:id | 编辑地址 |
| DELETE | /api/user/addresses/:id | 删除地址 |

#### 购物车接口（需 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/cart | 获取购物车 |
| POST | /api/cart | 添加商品到购物车 |
| PUT | /api/cart/:id | 修改数量 |
| DELETE | /api/cart/:id | 删除商品 |

#### 订单接口（需 JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/orders | 创建订单 |
| GET | /api/orders | 我的订单列表 |
| GET | /api/orders/:id | 订单详情 |
| PUT | /api/orders/:id/cancel | 取消订单 |

#### 管理后台接口（需 admin JWT）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/dashboard | 仪表盘统计数据 |
| GET | /api/admin/products | 商品管理列表 |
| POST | /api/admin/products | 新增商品 |
| PUT | /api/admin/products/:id | 编辑商品 |
| DELETE | /api/admin/products/:id | 删除商品 |
| POST | /api/admin/upload | 图片上传 |
| GET | /api/admin/categories | 分类列表 |
| POST | /api/admin/categories | 新增分类 |
| PUT | /api/admin/categories/:id | 编辑分类 |
| DELETE | /api/admin/categories/:id | 删除分类 |
| GET | /api/admin/orders | 订单管理列表 |
| GET | /api/admin/orders/:id | 订单详情 |
| PUT | /api/admin/orders/:id/status | 修改订单状态 |
| GET | /api/admin/users | 用户列表 |
| PUT | /api/admin/users/:id/status | 启用/禁用用户 |

### 4.3 关键业务规则

- 创建订单时：扣减库存（事务），将地址和商品信息写入快照
- 取消订单时：恢复库存，状态改为 cancelled
- 购物车在用户登录后合并：本地购物车数据合并到服务端

---

## 5. 前端路由设计

### 5.1 前台路由

| 路由 | 组件 | 需要登录 | 说明 |
|------|------|---------|------|
| `/` | Home.vue | 否 | 首页 |
| `/products` | ProductList.vue | 否 | 商品列表 |
| `/product/:id` | ProductDetail.vue | 否 | 商品详情 |
| `/cart` | Cart.vue | 否 | 购物车 |
| `/checkout` | Checkout.vue | 是 | 结算页 |
| `/login` | Login.vue | 否 | 登录 |
| `/register` | Register.vue | 否 | 注册 |
| `/user` | UserProfile.vue | 是 | 个人中心 |
| `/user/orders` | UserOrders.vue | 是 | 我的订单 |

### 5.2 后台路由

| 路由 | 组件 | 说明 |
|------|------|------|
| `/admin` | Dashboard.vue | 仪表盘 |
| `/admin/products` | ProductManage.vue | 商品列表 |
| `/admin/products/add` | ProductForm.vue | 新增商品 |
| `/admin/products/:id/edit` | ProductForm.vue | 编辑商品 |
| `/admin/categories` | CategoryManage.vue | 分类管理 |
| `/admin/orders` | OrderManage.vue | 订单管理 |
| `/admin/users` | UserManage.vue | 用户管理 |
| `/admin/login` | AdminLogin.vue | 管理员登录 |

### 5.3 路由守卫

```js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  if (to.path.startsWith('/admin')) {
    if (!authStore.isLoggedIn) {
      return next({ path: '/admin/login', query: { redirect: to.fullPath } })
    }
    if (authStore.user.role !== 'admin') {
      return next({ path: '/403' })
    }
  }
  next()
})
```

---

## 6. 状态管理（Pinia）

### 6.1 Store 清单

| Store | 文件 | 职责 |
|-------|------|------|
| auth | stores/auth.js | 登录/注册、Token 持久化、角色判断 |
| cart | stores/cart.js | 购物车 CRUD、本地与服务端同步 |
| product | stores/product.js | 商品列表、筛选条件、搜索 |
| order | stores/order.js | 订单列表、状态 |

| Store (admin) | 文件 | 职责 |
|---------------|------|------|
| dashboard | stores/admin/dashboard.js | 仪表盘统计数据 |
| product | stores/admin/product.js | 管理端商品操作 |
| order | stores/admin/order.js | 管理端订单操作 |
| user | stores/admin/user.js | 管理端用户操作 |

### 6.2 购物车同步策略

```
未登录 → 仅 localStorage
刚登录 → 合并 localStorage 到服务端，清空本地，切换到 API 模式
已登录 → 仅 API 模式
退出 → 清空内存状态，回到 localStorage 模式
```

---

## 7. 管理后台仪表盘

### 7.1 布局

- 顶行：4 个指标卡片（商品总数、本月订单、本月营收、用户总数）
- 中行：折线图（近7天订单趋势）+ 饼图（商品分类占比）
- 底行：最近订单表格

### 7.2 图表库

使用 Echarts，在 admin 路由下按需加载。

### 7.3 仪表盘 API 返回结构

```json
{
  "code": 200,
  "data": {
    "counts": {
      "products": 128,
      "orders": 56,
      "revenue": 38200,
      "users": 320
    },
    "orderTrend": [
      { "date": "2026-06-10", "count": 8, "amount": 5600 }
    ],
    "categoryDistribution": [
      { "name": "卧室家具", "count": 35 }
    ],
    "recentOrders": [
      {
        "orderNo": "TK20260614001",
        "username": "张三",
        "amount": 3200,
        "status": "paid",
        "createdAt": "2026-06-14T10:30:00Z"
      }
    ]
  }
}
```

---

## 8. 中间件设计

### 8.1 中间件链

```
请求进入 → cors() → express.json() → express.static('uploads')
  → routes
    → auth (JWT验证，路由级别)
      → adminAuth (管理员权限，admin路由)
        → 业务处理
  → errorHandler (全局错误捕获)
```

### 8.2 中间件职责

| 中间件 | 级别 | 职责 |
|--------|------|------|
| cors | 全局 | 跨域 |
| express.json | 全局 | JSON 解析 |
| express.static | 全局 | 静态文件（uploads/） |
| auth | 路由 | JWT 验证，注入 req.user |
| adminAuth | 路由 | 检查 req.user.role === 'admin' |
| errorHandler | 全局 | 捕获错误，返回统一格式 |

---

## 9. JWT 设计

- **算法**：HS256
- **Token 有效期**：7 天
- **Payload**：`{ userId, role }`
- **传递方式**：HTTP Header `Authorization: Bearer <token>`
- **前端存储**：`localStorage`

### 9.1 密码加密

- 使用 `bcrypt`，salt rounds = 10
- 注册和登录时均通过 bcrypt 进行 hash/compare
- 管理员初始密码通过 bcrypt hash 后写入数据库（seeder 脚本）

---

## 10. 订单状态流转

```
pending → paid → shipped → completed
   ↓         ↓         ↓
cancelled ← cancelled (条件：未发货)
```

- `pending`：已下单，待支付（模拟：后台点"确认支付"）
- `paid`：已支付，待发货（后台点"确认发货"）
- `shipped`：已发货，用户手动点击"确认收货"
- `completed`：已完成
- `cancelled`：已取消（从 pending 可直取消；从 paid 取消需未发货）

---

## 11. 技术决策记录

| 决策 | 选择 | 原因 |
|------|------|------|
| 项目结构 | 单体 + 角色路由 | 学习项目，降低复杂度 |
| 图片存储 | 本地文件系统 | 简单直接，无需外部依赖 |
| 支付 | 模拟 + 手动流转 | 无需商户资质，聚焦核心流程 |
| 商品模型 | 基础属性 | 降低数据库复杂度，先跑通流程 |
| 认证 | JWT | 无状态，适合前后分离 |
| 前台/后台认证 | 分离的登录入口 + role 字段 | 简单清晰 |
| 购物车 | 混合模式 | 兼顾登录/未登录体验 |

---

## 12. 边界条件与待定

- 确认收货：用户在前台"我的订单"页面手动点击"确认收货"，状态从 shipped 变为 completed
- 支付模拟：管理后台订单管理页提供"确认支付"按钮，手动切换状态
- 发货模拟：管理后台订单管理页提供"确认发货"按钮，手动切换状态
- 搜索：简单的 SQL LIKE 查询，不做全文索引
- 图片限制：单张不超过 5MB，每个商品最多 5 张图
- 用户自行取消订单：仅限 pending 状态的订单
- 删除商品：若存在未完成订单引用，禁止删除（硬约束）
- 后台管理员无需注册：提供 `server/seeds/admin.js` 脚本，使用 bcrypt 加密密码后插入 admin_users 表

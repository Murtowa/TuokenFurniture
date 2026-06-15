# 拓肯家具电商平台 — 设计规格

**日期**: 2026-06-15
**类型**: 学习项目
**技术栈**: Vue 3 + Vite + Pinia + Element-Plus + SCSS + Axios + Echarts / Node.js + Express + MySQL

---

## 1. 项目概述

拓肯家具电商平台，包含客户前台和管理后台，覆盖商品展示、用户系统、购物交易、后台管理全流程。定位为全栈学习项目。

## 2. 项目结构（方案 A — 单体前端 + 角色路由）

```
tuoken-furniture/
├── client/                # Vue 3 前端
│   ├── public/
│   ├── src/
│   │   ├── api/           # Axios 请求封装
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 公共组件
│   │   ├── layouts/       # LayoutClient.vue / LayoutAdmin.vue
│   │   ├── router/        # Vue Router 路由配置
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── styles/        # SCSS 全局样式
│   │   ├── utils/         # 工具函数
│   │   └── views/         # 页面组件
│   │       ├── client/    # 前台页面
│   │       └── admin/     # 后台页面
│   ├── .env               # 环境变量
│   ├── vite.config.js
│   └── package.json
├── server/                # Express 后端
│   ├── routes/            # 路由模块
│   ├── models/            # 数据库模型
│   ├── middleware/         # 中间件
│   ├── utils/             # 工具函数
│   ├── uploads/           # 图片上传目录
│   ├── app.js             # Express 入口
│   └── package.json
└── docs/
```

## 3. 前端设计

### 3.1 路由

**前台路由（客户可见）**:

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 轮播 Banner、分类入口、热门商品、新品推荐 |
| `/products` | 商品列表 | 分类筛选、价格排序、搜索、分页 |
| `/product/:id` | 商品详情 | 大图展示、规格参数、加入购物车 |
| `/cart` | 购物车 | 商品列表、数量修改、合计、去结算 |
| `/checkout` | 结算页 | 选择地址、确认订单、提交（需登录） |
| `/login` | 登录 | 用户名密码登录 |
| `/register` | 注册 | 用户注册 |
| `/user` | 个人中心 | 订单列表、收货地址管理、个人信息 |
| `/user/orders` | 我的订单 | 订单详情、状态查看 |

**后台路由（管理员可见，`/admin` 前缀）**:

| 路由 | 页面 | 说明 |
|------|------|------|
| `/admin` | 仪表盘 | 关键指标卡片 + Echarts 图表 |
| `/admin/products` | 商品管理 | 列表、新增、编辑、上架/下架 |
| `/admin/categories` | 分类管理 | 商品分类的增删改 |
| `/admin/orders` | 订单管理 | 订单列表、状态流转、详情 |
| `/admin/users` | 用户管理 | 用户列表、启用/禁用 |
| `/admin/login` | 管理员登录 | 独立于前台登录 |

### 3.2 路由守卫

- 需要登录的页面：用户未登录→跳转 `/login?redirect=xxx`
- 后台页面：需要 admin 角色，普通用户访问→403

### 3.3 核心组件树

```
App.vue
├── LayoutClient.vue (前台壳)
│   ├── AppHeader.vue (导航栏 + 搜索 + 购物车图标)
│   ├── <router-view> (页面内容)
│   └── AppFooter.vue
│
└── LayoutAdmin.vue (后台壳)
    ├── AdminSidebar.vue (侧边菜单)
    ├── AdminHeader.vue (顶栏)
    └── <router-view> (管理页面)
```

### 3.4 状态管理（Pinia）

| Store | 职责 |
|-------|------|
| `useAuthStore` | 用户登录态、token、角色、登录/退出 |
| `useCartStore` | 购物车商品列表、数量、合计金额 |
| `useProductStore` | 商品列表缓存、分类数据 |
| `useOrderStore` | 订单列表、订单详情 |

### 3.5 Axios 封装

- 请求拦截器：自动附带 JWT token
- 响应拦截器：统一错误处理，401 自动跳转登录
- `api/client/` 和 `api/admin/` 目录分离前后台请求

## 4. 数据库设计

### 4.1 表结构（8 张表）

**users** — 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增 |
| username | VARCHAR(50) UNIQUE | 用户名 |
| password | VARCHAR(255) | 加密密码 |
| nickname | VARCHAR(50) | 昵称 |
| phone | VARCHAR(20) | 手机号 |
| avatar | VARCHAR(255) | 头像路径 |
| status | TINYINT(1) | 1启用/0禁用 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

**admin_users** — 管理员表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增 |
| username | VARCHAR(50) UNIQUE | 用户名 |
| password | VARCHAR(255) | 加密密码 |
| nickname | VARCHAR(50) | 昵称 |
| role | VARCHAR(20) | 默认 'admin' |
| created_at | DATETIME | 创建时间 |

**addresses** — 收货地址表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增 |
| user_id | INT FK | 用户ID |
| receiver_name | VARCHAR(50) | 收件人 |
| phone | VARCHAR(20) | 联系电话 |
| province | VARCHAR(50) | 省 |
| city | VARCHAR(50) | 市 |
| district | VARCHAR(50) | 区 |
| detail | VARCHAR(255) | 详细地址 |
| is_default | TINYINT(1) | 默认地址 |
| timestamps | | |

**categories** — 商品分类表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增 |
| name | VARCHAR(50) | 分类名 |
| parent_id | INT | 父分类ID（自引用，NULL为顶级） |
| sort_order | INT | 排序序号 |
| icon | VARCHAR(255) | 分类图标 |
| created_at | DATETIME | |

**products** — 商品表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增 |
| category_id | INT FK | 分类ID |
| name | VARCHAR(100) | 商品名称 |
| description | TEXT | 商品描述 |
| price | DECIMAL(10,2) | 价格 |
| stock | INT | 库存数量 |
| main_image | VARCHAR(255) | 主图路径 |
| images | JSON | 图片数组 |
| status | TINYINT(1) | 1上架/0下架 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**orders** — 订单表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增 |
| order_no | VARCHAR(32) UNIQUE | 订单号 |
| user_id | INT FK | 用户ID |
| address_snapshot | JSON | 下单时收货地址快照 |
| total_amount | DECIMAL(10,2) | 总金额 |
| status | ENUM | pending→paid→shipped→completed；另 cancelled |
| remark | VARCHAR(255) | 备注 |
| paid_at | DATETIME | 支付时间 |
| shipped_at | DATETIME | 发货时间 |
| created_at | DATETIME | |
| updated_at | DATETIME | |

**order_items** — 订单明细表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增 |
| order_id | INT FK | 订单ID |
| product_id | INT FK | 商品ID |
| product_snapshot | JSON | 下单时商品快照（名称、价格、图片） |
| quantity | INT | 数量 |
| price | DECIMAL(10,2) | 下单时单价 |

**banners** — 首页轮播图表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 自增 |
| title | VARCHAR(100) | 标题 |
| image | VARCHAR(255) | 图片路径 |
| link | VARCHAR(255) | 跳转链接 |
| sort_order | INT | 排序 |
| created_at | DATETIME | |

### 4.2 关键设计要点

- **地址快照**：下单时将收货地址存为 JSON 快照，防止地址变更影响历史订单
- **商品快照**：order_items 保存下单时的商品名称/价格/图片，保证订单数据不变
- **分类自引用**：parent_id 支持二级分类（如：客厅家具 → 沙发）

## 5. 后端 API 设计

统一 `/api` 前缀，统一响应格式 `{ code, message, data }`。

### 5.1 公开接口

```
POST   /api/auth/register       用户注册
POST   /api/auth/login          用户登录
POST   /api/auth/admin-login    管理员登录
GET    /api/products            商品列表（分页、筛选、搜索、排序）
GET    /api/products/:id        商品详情
GET    /api/categories          分类列表（树形结构）
GET    /api/banners             首页轮播图
```

### 5.2 用户接口（需 JWT）

```
GET    /api/user/profile        个人信息
PUT    /api/user/profile        更新个人信息
GET    /api/user/addresses      地址列表
POST   /api/user/addresses      新增地址
PUT    /api/user/addresses/:id  编辑地址
DELETE /api/user/addresses/:id  删除地址
```

### 5.3 购物与订单（需 JWT）

购物车存储在 Pinia（不持久化到数据库），订单接口：

```
POST   /api/orders              创建订单
GET    /api/orders              我的订单列表
GET    /api/orders/:id          订单详情
PUT    /api/orders/:id/cancel   取消订单
```

### 5.4 管理后台接口（需 admin JWT）

```
GET    /api/admin/dashboard     仪表盘统计数据
GET    /api/admin/products      商品管理列表
POST   /api/admin/products      新增商品
PUT    /api/admin/products/:id  编辑商品
DELETE /api/admin/products/:id  删除商品
POST   /api/admin/upload        图片上传

GET    /api/admin/categories    分类管理列表
POST   /api/admin/categories    新增分类
PUT    /api/admin/categories/:id 编辑分类
DELETE /api/admin/categories/:id 删除分类

GET    /api/admin/orders        订单管理列表
GET    /api/admin/orders/:id    订单详情
PUT    /api/admin/orders/:id/status  修改订单状态

GET    /api/admin/users         用户列表
PUT    /api/admin/users/:id/status   启用/禁用用户
```

### 5.5 中间件栈

```
请求 → cors → json解析 → 路由匹配 → JWT验证（需认证路由）
                                    ↓
                              参数校验 → 业务处理 → 统一响应
                                    ↓
                              Joi 校验 → 400 参数错误
```

## 6. 认证方案

- **JWT**：登录后返回 token，前端存 localStorage，请求时通过 Axios 拦截器附加到 Header
- **双表认证**：users（客户）和 admin_users（管理员）分开，JWT payload 中携带角色标识
- **Token 过期**：设置合理过期时间（如 7 天），401 时前端自动清除 token 并跳转登录

## 7. 图片上传方案

- 前端通过 `el-upload` 组件上传到 `POST /api/admin/upload`
- 后端使用 `multer` 中间件接收文件，存到 `server/uploads/`
- Express 通过 `express.static('uploads')` 提供访问
- 文件名使用 UUID 重命名防止冲突
- 仅允许 jpg/png/webp 格式，限制 5MB

## 8. 边界确认

- 不做真实支付集成，订单状态在后台手动流转
- 不做物流追踪
- 不做用户端图片上传（头像使用默认图片）
- 购物车不持久化到数据库（仅 Pinia + localStorage）
- 不做商品评价/评论
- 不做优惠券/促销
- Banner 数据通过数据库直接填充（种子数据），不单独做 Banner 管理页面

---

**版本**: v1.0 | **状态**: 待审核

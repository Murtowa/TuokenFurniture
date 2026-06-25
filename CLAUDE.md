# Tuoken Furniture E-Commerce Platform

## Tech Stack
- Frontend: Vue 3 + Vite + Pinia + Element-Plus + SCSS + Axios + Echarts
- Backend: Node.js + Express + MySQL
- Auth: JWT (HS256) + bcrypt

## Project Structure
- `client/` - Vue 3 frontend (client store + admin panel via role-based routing)
- `server/` - Express REST API
- `docs/superpowers/specs/` - Design specifications

## Quick Start (首次部署)

### 1. 环境准备
- Node.js >= 18
- MySQL >= 8.0

### 2. 克隆项目
```bash
git clone https://github.com/Murtowa/TuokenFurniture.git
cd TuokenFurniture
```

### 3. 配置后端
```bash
cd server
cp .env.example .env           # 复制环境配置模板
# 编辑 .env，填入你的 MySQL 密码
npm install
```

### 4. 初始化数据库
```bash
# 导入表结构
mysql -u root -p < server/seeds/schema.sql

# 创建管理员账号 (admin / admin123)
node server/seeds/admin.js

# 导入示例数据（商品/分类/Banner 图片 + 数据）
node server/seeds/seed-data.js
```

### 5. 启动服务
```bash
# 终端1 - 后端
cd server && npm run dev       # http://localhost:3000

# 终端2 - 前端
cd client && npm install && npm run dev  # http://localhost:5173
```

### 6. 访问
- 前台商城：http://localhost:5173
- 管理后台：http://localhost:5173/admin/login
- 管理员账号：`admin` / `admin123`

## Conventions
- API prefix: `/api`
- Unified response: `{ code, message, data }`
- JWT in Authorization header: `Bearer <token>`
- All admin routes require admin role

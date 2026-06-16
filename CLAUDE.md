# Tuoken Furniture E-Commerce Platform

## Tech Stack
- Frontend: Vue 3 + Vite + Pinia + Element-Plus + SCSS + Axios + Echarts
- Backend: Node.js + Express + MySQL
- Auth: JWT (HS256) + bcrypt

## Project Structure
- `client/` - Vue 3 frontend (client store + admin panel via role-based routing)
- `server/` - Express REST API
- `docs/superpowers/specs/` - Design specifications

## Quick Start
1. `cd server && npm install && npm run dev`
2. Import `server/seeds/schema.sql` to MySQL
3. Run `node server/seeds/admin.js` to create admin user
4. `cd client && npm install && npm run dev`

## Conventions
- API prefix: `/api`
- Unified response: `{ code, message, data }`
- JWT in Authorization header: `Bearer <token>`
- All admin routes require admin role

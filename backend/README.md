# WorkDesk Backend (ES Modules - `"type": "module"`)

1. `npm install`
2. Copy `.env.example` to `.env` and fill in your MySQL password + JWT secret
3. In MySQL: `SOURCE database/schema.sql;`
4. `npm run seed`  (creates sample users; password for all: Password@123)
5. `npm run dev`

Test: POST /api/auth/login {"email":"admin@workdesk.com","password":"Password@123"},
then GET /api/admin/ping with header `Authorization: Bearer <token>`.

Full endpoint list: see API.md

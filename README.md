# 📝 Todo App

เว็บแอปจัดการงาน (Todo List) พร้อมระบบสมาชิกและปฏิทิน — Full-stack ด้วย React + Express + PostgreSQL

## ✨ ฟีเจอร์

- [x] สมัครสมาชิก / เข้าสู่ระบบ (JWT + bcrypt)
- [x] ข้อมูลแยกตามผู้ใช้ — แต่ละคนเห็นเฉพาะงานของตัวเอง
- [x] เพิ่ม / แก้ไข / ลบงาน
- [x] ปฏิทินรายเดือน พร้อม marker แสดงงานในแต่ละวัน
- [x] คลิกวันที่บนปฏิทิน → ฟอร์มสร้าง event
- [ ] เก็บ `description` และ `dueDate` (**รอ backend** — ดู [`docs/BACKEND_SPEC.md`](docs/BACKEND_SPEC.md))
- [ ] สรุปสถิติ (Total / Completed / Pending)

## 🛠️ เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, React Router 7, axios, dayjs |
| Backend | Node.js, Express 5, TypeScript, helmet, morgan |
| Database | PostgreSQL 18 (Docker) + Drizzle ORM |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Package Manager | pnpm |

## 📁 โครงสร้างโปรเจกต์

```
Todo-list/
├── db/                      Drizzle schema + PostgreSQL container
│   ├── db/schema.ts         นิยามตาราง user, todo
│   ├── _entrypoint/init.sh  script สร้าง appuser ตอนเปิด container ครั้งแรก
│   └── docker-compose.yml
│
├── backend/                 Express API (port 3001)
│   ├── src/
│   │   ├── index.ts         route ของ /todo
│   │   ├── routes/auth.ts   register / login / me
│   │   └── middleware/auth.ts  ตรวจ JWT
│   ├── db/                  สำเนาของ db/db (ต้อง sync ให้ตรงกัน)
│   └── api_spec/            Insomnia / Postman collection
│
├── frontend/                React + Vite (port 5173)
│   └── src/
│       ├── pages/           Login, Register, Todo
│       ├── components/      CalendarView, EventModal
│       ├── lib/auth.ts      จัดการ token + axios interceptor
│       └── types.ts
│
└── docs/BACKEND_SPEC.md     สเปกงานที่ backend ต้องทำเพิ่ม
```

> ⚠️ **สำคัญ:** `backend/db/schema.ts` เป็นสำเนาของ `db/db/schema.ts` — แก้ต้องแก้ทั้ง 2 ไฟล์ให้ตรงกัน

---

# 🚀 คู่มือติดตั้ง

> ทำตามลำดับ 0 → 4 ห้ามข้ามขั้น (backend ต้องมี db ก่อน / frontend ต้องมี backend ก่อน)

## ขั้นที่ 0 — ติดตั้งโปรแกรมที่จำเป็น

| โปรแกรม | เวอร์ชัน | ลิงก์ | ตรวจสอบด้วย |
|---------|:--------:|-------|-------------|
| Node.js | 20+ | https://nodejs.org | `node --version` |
| pnpm | 9+ | `npm install -g pnpm` | `pnpm --version` |
| Docker Desktop | ล่าสุด | https://www.docker.com/products/docker-desktop | `docker --version` |
| Git | ล่าสุด | https://git-scm.com | `git --version` |

> 💡 **ไม่ต้องติดตั้ง PostgreSQL เอง** — ใช้ผ่าน Docker

⚠️ ต้อง**เปิด Docker Desktop** ให้ทำงานก่อนเริ่มขั้นที่ 2 (เช็คด้วย `docker ps` ต้องไม่ error)

---

## ขั้นที่ 1 — Clone โปรเจกต์

```bash
git clone <URL ของ repo>
cd Todo-list
```

---

## ขั้นที่ 2 — ตั้งค่า Database

```bash
cd db
pnpm install
```

### สร้างไฟล์ `.env`

```powershell
Copy-Item .env.example .env
```

เปิดไฟล์ `.env` แล้วเติมค่าให้ครบ:

```env
POSTGRES_PASSWORD=1234
POSTGRES_USER=postgres
POSTGRES_DB=mydb
POSTGRES_PORT=4567
POSTGRES_HOST=localhost

POSTGRES_APP_USER=appuser
POSTGRES_APP_PASSWORD=1234
```

| ตัวแปร | หมายเหตุ |
|--------|----------|
| `POSTGRES_PASSWORD` | รหัส superuser — Docker ใช้ตอนสร้าง container |
| `POSTGRES_PORT` | ใช้ **4567** เพื่อเลี่ยงชนกับ PostgreSQL ที่อาจติดตั้งในเครื่อง (5432) |
| `POSTGRES_APP_USER` / `POSTGRES_APP_PASSWORD` | user ที่แอปใช้จริง — **ต้องตรงกับ `backend/.env`** |

> 🔒 มี user 2 ตัวเพราะหลัก least privilege: `postgres` ใช้ตอนตั้งค่าเท่านั้น ส่วน `appuser` มีสิทธิ์จำกัดกว่า ใช้รันแอปจริง

### แก้ line ending (เฉพาะ Windows)

```bash
pnpm run eol
```

### เปิดฐานข้อมูล + สร้างตาราง

```bash
docker compose up -d
pnpm run db:push
```

ตรวจสอบ:

```bash
docker ps
```

ต้องเห็น container `pf-db` สถานะ `Up` และ port `0.0.0.0:4567->5432/tcp` ✅

---

## ขั้นที่ 3 — ตั้งค่า Backend

**เปิด terminal ใหม่**

```bash
cd backend
pnpm install
```

### สร้างไฟล์ `.env`

```powershell
Copy-Item .env.example .env
```

แก้ค่าให้ตรงกับที่ตั้งไว้ใน `db/.env` และ**ตั้ง `JWT_SECRET` เอง**:

```env
PORT=3001

POSTGRES_DB=mydb
POSTGRES_PORT=4567
POSTGRES_HOST=localhost
POSTGRES_APP_USER=appuser
POSTGRES_APP_PASSWORD=1234

DEBUG=pf*

JWT_SECRET=ใส่ข้อความสุ่มยาวๆที่เดายาก
```

> ⚠️ **3 ค่าที่ต้องแก้จากค่าเริ่มต้น:**
> - `POSTGRES_PORT` → `4567`
> - `POSTGRES_APP_PASSWORD` → รหัสเดียวกับ `db/.env`
> - `JWT_SECRET` → ตั้งเอง (ตั้งไม่เหมือนเพื่อนก็ได้)

**สร้าง JWT_SECRET แบบสุ่ม** (แนะนำ — ปลอดภัยกว่าคิดเอง):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### รัน

```bash
pnpm run dev
```

ควรเห็น: `pf-backend Listening on port 3001: http://localhost:3001`

> ⚠️ **ปล่อย terminal นี้รันค้างไว้**

---

## ขั้นที่ 4 — ตั้งค่า Frontend

**เปิด terminal ใหม่อีกอัน**

```bash
cd frontend
pnpm install
pnpm dev
```

เปิด http://localhost:5173 🎉

> 💡 **ไม่ต้องสร้าง `.env`** — frontend ใช้ Vite proxy (ตั้งไว้แล้วใน `vite.config.ts`) เวลาเรียก `/api/todo` จะถูกส่งต่อไป `http://localhost:3001/todo` อัตโนมัติ ทำให้ไม่มีปัญหา CORS

---

## ✅ เช็คลิสต์ว่าติดตั้งสำเร็จ

- [ ] `docker ps` เห็น `pf-db` สถานะ `Up`
- [ ] `http://localhost:3001/todo` ตอบ **401** (ถูกต้อง — เพราะยังไม่ได้ล็อกอิน)
- [ ] `http://localhost:5173` เด้งไปหน้าเข้าสู่ระบบ
- [ ] สมัครสมาชิกได้ → เข้าหน้า Todo
- [ ] เพิ่มงานได้ + refresh แล้วข้อมูลยังอยู่
- [ ] เห็นปฏิทิน และคลิกวันที่แล้ว modal เด้ง

---

## 🔁 ทุกครั้งที่จะเริ่มทำงาน

| ลำดับ | ทำอะไร |
|:-----:|--------|
| 1 | เปิด **Docker Desktop** |
| 2 | `cd db` → `docker compose up -d` (ถ้า container ยังไม่รัน) |
| 3 | Terminal 1: `cd backend` → `pnpm run dev` |
| 4 | Terminal 2: `cd frontend` → `pnpm dev` |

**หยุดฐานข้อมูล:** `cd db` → `docker compose down`
(ข้อมูลไม่หาย เพราะเก็บใน Docker volume — ถ้าอยากลบข้อมูลทั้งหมดใช้ `docker compose down -v`)

---

## 📜 คำสั่งที่ใช้บ่อย

### db

| คำสั่ง | ทำอะไร |
|--------|--------|
| `docker compose up -d` | เปิดฐานข้อมูล |
| `docker compose down` | ปิดฐานข้อมูล |
| `pnpm run db:push` | ส่ง schema เข้า DB ตรง ๆ (เหมาะกับตอน dev) |
| `pnpm run db:studio` | เปิดหน้าเว็บดู/แก้ข้อมูลในตาราง |
| `pnpm run eol` | แก้ line ending ของ `.sh` (Windows) |

### backend

| คำสั่ง | ทำอะไร |
|--------|--------|
| `pnpm run dev` | รัน server แบบ auto-reload (nodemon) |
| `pnpm run build` | build เป็น JavaScript |

### frontend

| คำสั่ง | ทำอะไร |
|--------|--------|
| `pnpm dev` | รัน dev server |
| `pnpm build` | build สำหรับ production |

---

## 🔌 API Endpoints

Base URL: `http://localhost:3001`

### Auth

| Method | Path | ต้องล็อกอิน | Body | คำอธิบาย |
|--------|------|:-----------:|------|----------|
| POST | `/auth/register` | ❌ | `{ email, password }` | สมัครสมาชิก → ได้ token |
| POST | `/auth/login` | ❌ | `{ email, password }` | เข้าสู่ระบบ → ได้ token |
| GET | `/auth/me` | ✅ | — | ดูข้อมูลผู้ใช้ปัจจุบัน |

### Todo (ต้องล็อกอินทุก endpoint)

| Method | Path | Body | คำอธิบาย |
|--------|------|------|----------|
| GET | `/todo` | — | ดูงานทั้งหมด **ของตัวเอง** |
| PUT | `/todo` | `{ todoText }` | สร้างงานใหม่ |
| PATCH | `/todo` | `{ id, todoText }` | แก้ไขงาน |
| DELETE | `/todo` | `{ id }` | ลบงาน |
| POST | `/todo/all` | — | ลบงานทั้งหมดของตัวเอง |

> 📌 **หมายเหตุ**
> - route ที่ต้องล็อกอิน ให้แนบ header: `Authorization: Bearer <token>`
> - ใช้ **`PUT`** สำหรับสร้าง (ไม่ใช่ `POST`) และ field ชื่อ **`todoText`** (ไม่ใช่ `title`)
> - ทุก endpoint ของ `/todo` กรองด้วย `userId` จาก token — ผู้ใช้แก้/ลบงานคนอื่นไม่ได้

### ตัวอย่างทดสอบ (PowerShell)

```powershell
# สมัครสมาชิก
Invoke-RestMethod -Uri http://localhost:3001/auth/register -Method Post -ContentType "application/json" -Body '{"email":"test@test.com","password":"123456"}'

# เข้าสู่ระบบ แล้วเก็บ token
$res = Invoke-RestMethod -Uri http://localhost:3001/auth/login -Method Post -ContentType "application/json" -Body '{"email":"test@test.com","password":"123456"}'
$h = @{ Authorization = "Bearer $($res.token)" }

# สร้างงาน
Invoke-RestMethod -Uri http://localhost:3001/todo -Method Put -Headers $h -ContentType "application/json" -Body '{"todoText":"อ่านหนังสือ"}'

# ดูงานทั้งหมด
Invoke-RestMethod -Uri http://localhost:3001/todo -Headers $h
```

---

## 🗄️ โครงสร้างฐานข้อมูล

### ตาราง `user`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|----------|
| `id` | uuid | PK, สุ่มอัตโนมัติ |
| `email` | varchar(255) | **unique** |
| `password_hash` | varchar(255) | bcrypt hash — ไม่เก็บรหัสจริง |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### ตาราง `todo`

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|----------|
| `id` | uuid | PK, สุ่มอัตโนมัติ |
| `user_id` | uuid | **FK → user.id** (`on delete cascade`) |
| `todo_text` | varchar(255) | |
| `is_done` | boolean | default `false` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

> ⏰ ใช้ `timestamptz` (timestamp with time zone) ทุกคอลัมน์เวลา เพื่อไม่ให้เวลาเพี้ยนระหว่าง Postgres (`now()`) กับ JavaScript (`new Date()`)

---

## 👥 ข้อตกลงการทำงานร่วมกัน

### Git Workflow

- **ห้าม push ตรงเข้า `main`** — แยก branch แล้วเปิด Pull Request
- ตั้งชื่อ branch ตามฟีเจอร์: `feature/calendar`, `fix/login-error`
- เขียน commit message ให้สื่อความหมาย

```bash
git checkout -b feature/ชื่อฟีเจอร์
git add .
git commit -m "อธิบายสิ่งที่ทำ"
git push -u origin feature/ชื่อฟีเจอร์
```

### หลัง `git pull` ทุกครั้ง

```bash
cd db && pnpm install && pnpm run db:push
cd ../backend && pnpm install
cd ../frontend && pnpm install
```

### สิ่งที่ต้องระวัง

| เรื่อง | ทำไม |
|-------|------|
| **ห้าม commit ไฟล์ `.env`** | มีรหัสผ่านและ JWT secret |
| **แก้ `schema.ts` ต้องแก้ 2 ที่** | `db/db/` และ `backend/db/` ต้องตรงกัน |
| **ห้าม commit `node_modules/`** | ใหญ่มาก ติดตั้งใหม่ได้จาก `package.json` |
| **ห้ามย้าย `node_modules` ด้วยมือ** | pnpm ใช้ symlink จะพัง — ให้ลบแล้ว `pnpm install` ใหม่ |

---

## 🐛 ปัญหาที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| `failed to connect to the docker API` | Docker Desktop ไม่ได้เปิด | เปิด Docker Desktop รอจนไอคอนนิ่ง |
| `port is already allocated` | port ชนกับ PostgreSQL ในเครื่อง | เปลี่ยน `POSTGRES_PORT` ใน `db/.env` |
| `Invalid DB env.` | `.env` ไม่ครบ | เช็คว่ามีครบทุกตัวแปร |
| `password authentication failed` | รหัสใน `backend/.env` ไม่ตรงกับ `db/.env` | แก้ `POSTGRES_APP_PASSWORD` ให้ตรงกัน |
| `relation "todo" does not exist` | ยังไม่ได้สร้างตาราง | `cd db` → `pnpm run db:push` |
| API ตอบ 401 ตลอด | `JWT_SECRET` ไม่ได้ตั้ง หรือ token หมดอายุ | เช็ค `.env` แล้วล็อกอินใหม่ |
| `app crashed` ตอน `pnpm run dev` | ยังไม่ได้ `pnpm install` | รัน `pnpm install` ก่อน |
| `ERR_PNPM_IGNORED_BUILDS: bcrypt` | pnpm ไม่อนุญาตให้ build native module | ตั้ง `bcrypt: true` ใน `backend/pnpm-workspace.yaml` แล้ว `pnpm install` |
| entrypoint script ไม่ทำงาน | line ending เป็น CRLF | `pnpm run eol` แล้ว `docker compose down -v` + `up -d` |
| หน้าเว็บขาวเปล่า | JavaScript error | เปิด DevTools (F12) ดู Console |
| CSS ไม่ทำงาน | ลืม `import "./index.css"` | เช็ค import ใน `main.tsx` |
| เวลาเพี้ยนไป 7 ชั่วโมง | คอลัมน์เป็น `timestamp` ไม่ใช่ `timestamptz` | ใส่ `{ withTimezone: true }` ใน schema |

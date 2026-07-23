# 📝 Todo App

เว็บแอปจัดการงาน (Todo List) — Full-stack ด้วย React + Express + PostgreSQL

## 🛠️ เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
|------|-----------|
| Frontend | React 19, TypeScript, Vite, axios, dayjs |
| Backend | Node.js, Express 5, TypeScript, helmet, morgan |
| Database | PostgreSQL 18 (Docker) + Drizzle ORM |
| Package Manager | pnpm |

## 📁 โครงสร้างโปรเจกต์

```
Todo-list/
├── db/           Drizzle schema + PostgreSQL container
│   ├── db/       schema.ts, client.ts, utils.ts
│   ├── _entrypoint/  script ตั้งค่า DB ครั้งแรก
│   └── docker-compose.yml
├── backend/      Express API (port 3001)
│   ├── src/      index.ts
│   ├── db/       สำเนาของ db/db (ต้อง sync ให้ตรงกัน)
│   └── api_spec/ Insomnia / Postman collection
└── frontend/     React + Vite (port 5173)
    └── src/      App.tsx, types.ts
```

> ⚠️ **สำคัญ:** `backend/db/schema.ts` เป็นสำเนาของ `db/db/schema.ts` — ถ้าแก้ต้องแก้ทั้ง 2 ไฟล์ให้ตรงกัน

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

> 💡 **ไม่ต้องติดตั้ง PostgreSQL เอง** — เราใช้ผ่าน Docker

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
| `POSTGRES_PORT` | **`4567`** (เลี่ยงชนกับ PostgreSQL ที่อาจติดตั้งในเครื่องที่ port 5432) |
| `POSTGRES_APP_USER` / `POSTGRES_APP_PASSWORD` | user ที่แอปใช้จริง — **ต้องตรงกับ `backend/.env`** |

> 🔒 ทำไมมี user 2 ตัว: `postgres` เป็น superuser ใช้ตอนตั้งค่าเท่านั้น ส่วน `appuser` มีสิทธิ์จำกัดกว่า ใช้รันแอปจริง (หลัก least privilege)

### แก้ line ending (เฉพาะ Windows)

```bash
pnpm run eol
```

### เปิดฐานข้อมูล

```bash
docker compose up -d
```

ตรวจสอบ:

```bash
docker ps
```

ต้องเห็น container `pf-db` สถานะ `Up` และ port `0.0.0.0:4567->5432/tcp` ✅

### สร้างตาราง

```bash
pnpm run db:push
```

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

แก้ค่าให้ตรงกับที่ตั้งไว้ใน `db/.env`:

```env
PORT=3001

POSTGRES_DB=mydb
POSTGRES_PORT=4567
POSTGRES_HOST=localhost
POSTGRES_APP_USER=appuser
POSTGRES_APP_PASSWORD=1234

DEBUG=pf*
```

> ⚠️ **2 ค่าที่ต้องแก้จากค่าเริ่มต้น:** `POSTGRES_PORT` (5432 → 4567) และ `POSTGRES_APP_PASSWORD` (ว่าง → รหัสของคุณ) — ถ้าไม่ตรงกับ `db/.env` จะต่อฐานข้อมูลไม่ได้

### รัน

```bash
pnpm run dev
```

ควรเห็น: `pf-backend Listening on port 3001: http://localhost:3001`

**ทดสอบ:**

```powershell
Invoke-RestMethod -Uri http://localhost:3001/todo
```

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
- [ ] `http://localhost:3001/todo` ตอบกลับมา (array ว่างก็ถือว่าผ่าน)
- [ ] `http://localhost:5173` แสดงหน้าเว็บ
- [ ] เพิ่มงานใหม่ได้ และ refresh แล้วข้อมูลยังอยู่

---

## 🔁 ทุกครั้งที่จะเริ่มทำงาน

| ลำดับ | ทำอะไร |
|:-----:|--------|
| 1 | เปิด **Docker Desktop** (ถ้ายังไม่เปิด) |
| 2 | `cd db` → `docker compose up -d` (ถ้า container ยังไม่รัน) |
| 3 | Terminal 1: `cd backend` → `pnpm run dev` |
| 4 | Terminal 2: `cd frontend` → `pnpm dev` |

**หยุดฐานข้อมูล:**

```bash
cd db
docker compose down
```

> ข้อมูลไม่หาย เพราะเก็บใน Docker volume — ถ้าอยากลบข้อมูลทั้งหมดใช้ `docker compose down -v`

---

## 📜 คำสั่งที่ใช้บ่อย

### db

| คำสั่ง | ทำอะไร |
|--------|--------|
| `docker compose up -d` | เปิดฐานข้อมูล |
| `docker compose down` | ปิดฐานข้อมูล |
| `pnpm run db:push` | ส่ง schema เข้า DB ตรง ๆ (เหมาะกับตอน dev) |
| `pnpm run db:generate` | สร้างไฟล์ migration |
| `pnpm run db:migrate` | รัน migration |
| `pnpm run eol` | แก้ line ending ของ `.sh` (Windows) |

### backend

| คำสั่ง | ทำอะไร |
|--------|--------|
| `pnpm run dev` | รัน server แบบ auto-reload (nodemon) |
| `pnpm run build` | build เป็น JavaScript |
| `pnpm start` | รันเวอร์ชันที่ build แล้ว |

### frontend

| คำสั่ง | ทำอะไร |
|--------|--------|
| `pnpm dev` | รัน dev server |
| `pnpm build` | build สำหรับ production |
| `pnpm preview` | ดูผลลัพธ์หลัง build |

---

## 🔌 API Endpoints

Base URL: `http://localhost:3001`

| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | `/todo` | ดูงานทั้งหมด |
| PUT | `/todo` | สร้างงานใหม่ — body: `{ "todoText": "..." }` |
| PATCH | `/todo` | แก้ไขงาน |
| DELETE | `/todo` | ลบงาน |

> 📌 สังเกตว่าใช้ **`PUT`** สำหรับสร้าง (ไม่ใช่ `POST`) และ field ชื่อ **`todoText`** (ไม่ใช่ `title`)

### ตัวอย่างทดสอบ (PowerShell)

```powershell
# สร้างงาน
Invoke-RestMethod -Uri http://localhost:3001/todo -Method Put -ContentType "application/json" -Body '{"todoText":"อ่านหนังสือ"}'

# ดูงานทั้งหมด
Invoke-RestMethod -Uri http://localhost:3001/todo
```

> 💡 มี Insomnia / Postman collection พร้อมใช้ใน `backend/api_spec/`

---

## 🐛 ปัญหาที่พบบ่อย

| อาการ | สาเหตุ | วิธีแก้ |
|-------|--------|---------|
| `failed to connect to the docker API` | Docker Desktop ไม่ได้เปิด | เปิด Docker Desktop รอจนไอคอนนิ่ง |
| `port is already allocated` | port ชนกับ PostgreSQL ในเครื่อง | เปลี่ยน `POSTGRES_PORT` ใน `db/.env` |
| `Invalid DB env.` | `.env` ไม่ครบ | เช็คว่ามีครบทุกตัวแปร |
| `password authentication failed` | รหัสใน `backend/.env` ไม่ตรงกับ `db/.env` | แก้ `POSTGRES_APP_PASSWORD` ให้ตรงกัน |
| `relation "todo" does not exist` | ยังไม่ได้สร้างตาราง | `cd db` → `pnpm run db:push` |
| `app crashed` ตอน `pnpm run dev` | ยังไม่ได้ `pnpm install` | รัน `pnpm install` ก่อน |
| entrypoint script ไม่ทำงาน | line ending เป็น CRLF | `pnpm run eol` แล้ว `docker compose down -v` + `up -d` |
| หน้าเว็บขาวเปล่า | JavaScript error | เปิด DevTools (F12) ดู Console |

---

## 👥 ข้อตกลงการทำงานร่วมกัน

- **ห้าม push ตรงเข้า `main`** — แยก branch แล้วเปิด Pull Request
- ตั้งชื่อ branch ตามฟีเจอร์: `feature/auth`, `fix/login-error`
- **ห้าม commit ไฟล์ `.env`** — มีรหัสผ่าน
- แก้ `schema.ts` ต้องแก้ **ทั้ง `db/db/` และ `backend/db/`** ให้ตรงกัน
- รัน `pnpm install` หลัง `git pull` ทุกครั้ง

```bash
git checkout -b feature/ชื่อฟีเจอร์
git add .
git commit -m "อธิบายสิ่งที่ทำ"
git push -u origin feature/ชื่อฟีเจอร์
```

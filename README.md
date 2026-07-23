# Todo App

เว็บแอปจดงานพร้อมระบบสมาชิกและปฏิทิน ทำด้วย React + Express + PostgreSQL

## ฟีเจอร์

- สมัครสมาชิก / เข้าสู่ระบบ
- เพิ่ม แก้ไข ลบงาน
- แต่ละคนเห็นเฉพาะงานของตัวเอง
- ปฏิทินรายเดือน แสดงงานในแต่ละวัน
- คลิกวันที่บนปฏิทินเพื่อสร้าง event พร้อมรายละเอียด

ยังไม่เสร็จ: การเก็บ description กับ dueDate (รอฝั่ง backend ดูรายละเอียดใน `docs/BACKEND_SPEC.md`)

## เทคโนโลยี

- Frontend: React 19, TypeScript, Vite, React Router, axios, dayjs
- Backend: Express 5, TypeScript, helmet, morgan
- Database: PostgreSQL 18 (รันบน Docker) กับ Drizzle ORM
- Auth: JWT + bcrypt
- ใช้ pnpm เป็น package manager

## โครงสร้าง

```
Todo-list/
├── db/                      schema และ container ของฐานข้อมูล
│   ├── db/schema.ts         นิยามตาราง user, todo
│   ├── _entrypoint/init.sh  สร้าง appuser ตอนเปิด container ครั้งแรก
│   └── docker-compose.yml
│
├── backend/                 API (port 3001)
│   ├── src/
│   │   ├── index.ts         route ของ /todo
│   │   ├── routes/auth.ts   register, login, me
│   │   └── middleware/auth.ts
│   ├── db/                  สำเนาของ db/db
│   └── api_spec/            collection ของ Insomnia กับ Postman
│
├── frontend/                หน้าเว็บ (port 5173)
│   └── src/
│       ├── pages/           Login, Register, Todo
│       ├── components/      CalendarView, EventModal
│       └── lib/auth.ts      จัดการ token
│
└── docs/BACKEND_SPEC.md
```

หมายเหตุ: `backend/db/schema.ts` เป็นสำเนาของ `db/db/schema.ts` ถ้าแก้ต้องแก้ทั้งสองไฟล์ให้ตรงกัน

---

## การติดตั้ง

ทำตามลำดับ อย่าข้ามขั้น เพราะ backend ต้องรอ database และ frontend ต้องรอ backend

### 0. โปรแกรมที่ต้องมี

- Node.js 20 ขึ้นไป
- pnpm 9 ขึ้นไป (`npm install -g pnpm`)
- Docker Desktop
- Git

ไม่ต้องติดตั้ง PostgreSQL เอง เพราะเรารันผ่าน Docker

เช็คว่าครบด้วย `node --version`, `pnpm --version`, `docker --version`

ก่อนเริ่มขั้นที่ 2 ต้องเปิด Docker Desktop ให้ทำงานก่อน ลองพิมพ์ `docker ps` ดู ถ้าไม่ error แปลว่าพร้อม

### 1. Clone

```bash
git clone https://github.com/fullstack69-pf/Todo-list.git
cd Todo-list
```

### 2. Database

```bash
cd db
pnpm install
```

ก๊อป `.env.example` เป็น `.env` แล้วเติมค่า

```env
POSTGRES_PASSWORD=1234
POSTGRES_USER=postgres
POSTGRES_DB=mydb
POSTGRES_PORT=4567
POSTGRES_HOST=localhost

POSTGRES_APP_USER=appuser
POSTGRES_APP_PASSWORD=1234
```

ที่ใช้ port 4567 แทน 5432 เพราะกันชนกับ PostgreSQL ที่บางคนติดตั้งไว้ในเครื่องอยู่แล้ว

ส่วน `POSTGRES_APP_USER` กับ `POSTGRES_APP_PASSWORD` ต้องจำไว้ เดี๋ยวต้องใส่ให้ตรงกันใน backend ด้วย เหตุผลที่มี user สองตัวคือ `postgres` เป็น superuser ใช้แค่ตอนตั้งค่า ส่วน `appuser` สิทธิ์น้อยกว่าไว้ให้แอปใช้จริง

ถ้าใช้ Windows ให้รันคำสั่งนี้ก่อน เพื่อแก้ line ending ของ shell script

```bash
pnpm run eol
```

จากนั้นเปิดฐานข้อมูลและสร้างตาราง

```bash
docker compose up -d
pnpm run db:push
```

เช็คด้วย `docker ps` ต้องเห็น container ชื่อ `pf-db` สถานะ Up

### 3. Backend

เปิด terminal ใหม่

```bash
cd backend
pnpm install
```

ก๊อป `.env.example` เป็น `.env` แล้วแก้สามค่า

```env
PORT=3001

POSTGRES_DB=mydb
POSTGRES_PORT=4567
POSTGRES_HOST=localhost
POSTGRES_APP_USER=appuser
POSTGRES_APP_PASSWORD=1234

DEBUG=pf*

JWT_SECRET=
```

- `POSTGRES_PORT` เปลี่ยนจาก 5432 เป็น 4567
- `POSTGRES_APP_PASSWORD` ใส่ให้ตรงกับที่ตั้งไว้ใน `db/.env`
- `JWT_SECRET` ตั้งเอง เป็นข้อความสุ่มยาว ๆ ไม่ต้องเหมือนคนอื่น

อยากได้ค่าสุ่มใช้คำสั่งนี้ได้

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

รัน server

```bash
pnpm run dev
```

ถ้าขึ้น `pf-backend Listening on port 3001` แปลว่าใช้ได้ ปล่อย terminal นี้ไว้อย่าปิด

### 4. Frontend

เปิด terminal ใหม่อีกอัน

```bash
cd frontend
pnpm install
pnpm dev
```

เปิด http://localhost:5173

ฝั่ง frontend ไม่ต้องสร้าง `.env` เพราะตั้ง proxy ไว้ใน `vite.config.ts` แล้ว เวลาเรียก `/api/todo` มันจะส่งต่อไปที่ backend ให้เอง

### เช็คว่าติดตั้งสำเร็จ

- `docker ps` เห็น `pf-db` สถานะ Up
- เปิด http://localhost:3001/todo แล้วได้ 401 (ถูกแล้ว เพราะยังไม่ได้ล็อกอิน)
- เปิด http://localhost:5173 แล้วเด้งไปหน้าเข้าสู่ระบบ
- สมัครสมาชิกแล้วเข้าหน้า Todo ได้
- เพิ่มงานแล้ว refresh ข้อมูลยังอยู่

---

## การใช้งานประจำวัน

ทุกครั้งที่จะเริ่มทำงาน

1. เปิด Docker Desktop
2. `cd db` แล้ว `docker compose up -d` (ถ้ายังไม่ได้เปิด container)
3. terminal แรก `cd backend` แล้ว `pnpm run dev`
4. terminal ที่สอง `cd frontend` แล้ว `pnpm dev`

เลิกงานปิดฐานข้อมูลด้วย `docker compose down` ข้อมูลไม่หายเพราะเก็บใน volume ถ้าอยากล้างข้อมูลทั้งหมดใช้ `docker compose down -v`

### คำสั่งอื่น ๆ

ใน `db/`

- `pnpm run db:push` ส่ง schema เข้าฐานข้อมูล
- `pnpm run db:studio` เปิดหน้าเว็บดูข้อมูลในตาราง
- `pnpm run eol` แก้ line ending ของ .sh

ใน `backend/`

- `pnpm run dev` รัน server แบบ auto-reload
- `pnpm run build` build เป็น JavaScript

ใน `frontend/`

- `pnpm dev` รัน dev server
- `pnpm build` build สำหรับ production

---

## API

base url คือ `http://localhost:3001`

### Auth

| Method | Path | Body | หมายเหตุ |
|--------|------|------|----------|
| POST | `/auth/register` | `{ email, password }` | สมัครแล้วได้ token เลย |
| POST | `/auth/login` | `{ email, password }` | ได้ token |
| GET | `/auth/me` | - | ต้องมี token |

### Todo

ทุก endpoint ต้องแนบ header `Authorization: Bearer <token>`

| Method | Path | Body |
|--------|------|------|
| GET | `/todo` | - |
| PUT | `/todo` | `{ todoText }` |
| PATCH | `/todo` | `{ id, todoText }` |
| DELETE | `/todo` | `{ id }` |
| POST | `/todo/all` | - |

ข้อควรรู้

- สร้างงานใช้ `PUT` ไม่ใช่ `POST`
- field ชื่อ `todoText` ไม่ใช่ `title`
- ทุก endpoint ของ todo กรองด้วย userId จาก token อยู่แล้ว แก้หรือลบงานคนอื่นไม่ได้

ตัวอย่างทดสอบด้วย PowerShell

```powershell
$res = Invoke-RestMethod -Uri http://localhost:3001/auth/login -Method Post -ContentType "application/json" -Body '{"email":"test@test.com","password":"123456"}'
$h = @{ Authorization = "Bearer $($res.token)" }

Invoke-RestMethod -Uri http://localhost:3001/todo -Method Put -Headers $h -ContentType "application/json" -Body '{"todoText":"อ่านหนังสือ"}'
Invoke-RestMethod -Uri http://localhost:3001/todo -Headers $h
```

ถ้าไม่อยากพิมพ์เอง ใน `backend/api_spec/` มี collection ของ Insomnia กับ Postman ให้ import ได้

---

## ตารางในฐานข้อมูล

**user**

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|----------|
| id | uuid | primary key |
| email | varchar(255) | unique |
| password_hash | varchar(255) | เก็บ hash จาก bcrypt ไม่ใช่รหัสจริง |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**todo**

| คอลัมน์ | ชนิด | หมายเหตุ |
|---------|------|----------|
| id | uuid | primary key |
| user_id | uuid | foreign key ไปที่ user.id ลบ user แล้วงานลบตาม |
| todo_text | varchar(255) | |
| is_done | boolean | default false |
| created_at | timestamptz | |
| updated_at | timestamptz | |

คอลัมน์เวลาใช้ `timestamptz` ทั้งหมด ถ้าใช้ `timestamp` ธรรมดาเวลาจะเพี้ยนไป 7 ชั่วโมง เพราะ Postgres กับ JavaScript เก็บคนละโซน

---

## การทำงานร่วมกัน

- อย่า push ตรงเข้า main ให้แยก branch แล้วเปิด pull request
- ตั้งชื่อ branch ตามฟีเจอร์ เช่น `feature/calendar`, `fix/login-error`
- เขียน commit message ให้รู้เรื่องว่าทำอะไร

```bash
git checkout -b feature/ชื่อฟีเจอร์
git add .
git commit -m "อธิบายสิ่งที่ทำ"
git push -u origin feature/ชื่อฟีเจอร์
```

หลัง pull ทุกครั้งควรรัน

```bash
cd db && pnpm install && pnpm run db:push
cd ../backend && pnpm install
cd ../frontend && pnpm install
```

สิ่งที่ต้องระวัง

- ห้าม commit ไฟล์ `.env` เพราะมีรหัสผ่านกับ JWT secret
- แก้ `schema.ts` ต้องแก้ทั้ง `db/db/` และ `backend/db/`
- ห้ามย้ายโฟลเดอร์ `node_modules` ด้วยมือ เพราะ pnpm ใช้ symlink จะพัง ถ้าจะย้ายให้ลบทิ้งแล้ว `pnpm install` ใหม่

---

## ปัญหาที่เจอบ่อย

| อาการ | วิธีแก้ |
|-------|---------|
| `failed to connect to the docker API` | ยังไม่ได้เปิด Docker Desktop |
| `port is already allocated` | port ชนกัน เปลี่ยน `POSTGRES_PORT` ใน `db/.env` |
| `Invalid DB env.` | ค่าใน `.env` ไม่ครบ |
| `password authentication failed` | รหัสใน `backend/.env` ไม่ตรงกับ `db/.env` |
| `relation "todo" does not exist` | ยังไม่ได้รัน `pnpm run db:push` |
| API ตอบ 401 ตลอด | ยังไม่ได้ตั้ง `JWT_SECRET` หรือ token หมดอายุ ลองล็อกอินใหม่ |
| `app crashed` ตอนรัน dev | ยังไม่ได้ `pnpm install` |
| `ERR_PNPM_IGNORED_BUILDS: bcrypt` | ตั้ง `bcrypt: true` ใน `backend/pnpm-workspace.yaml` แล้ว install ใหม่ |
| entrypoint script ไม่ทำงาน | line ending เป็น CRLF รัน `pnpm run eol` แล้ว `docker compose down -v` กับ `up -d` |
| หน้าเว็บขาวเปล่า | เปิด DevTools (F12) ดู Console |
| เวลาเพี้ยน 7 ชั่วโมง | คอลัมน์ยังเป็น `timestamp` ต้องใส่ `{ withTimezone: true }` |

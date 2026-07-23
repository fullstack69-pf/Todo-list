import { dbClient } from "@db/client.js";
import { userTable } from "@db/schema.js";
import { requireAuth, type JwtPayload } from "@src/middleware/auth.js";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { Router } from "express";
import jwt from "jsonwebtoken";

const router: Router = Router();

const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = "7d";

function createToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

// สมัครสมาชิก
router.post("/register", async (req, res, next) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();
    const password = req.body.password ?? "";

    if (!email || !password) {
      res.status(400).json({ message: "กรุณากรอก email และ password" });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: "รหัสผ่านต้องยาวอย่างน้อย 6 ตัว" });
      return;
    }

    // เช็คว่าอีเมลนี้ถูกใช้แล้วหรือยัง
    const existing = await dbClient.query.userTable.findFirst({
      where: eq(userTable.email, email),
    });
    if (existing) {
      res.status(409).json({ message: "อีเมลนี้ถูกใช้แล้ว" });
      return;
    }

    // เข้ารหัสรหัสผ่าน — ไม่เก็บรหัสจริงลงฐานข้อมูล
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await dbClient
      .insert(userTable)
      .values({ email, passwordHash })
      .returning({ id: userTable.id, email: userTable.email });

    const user = result[0]!;
    const token = createToken({ userId: user.id, email: user.email });

    res.status(201).json({ msg: "Register successfully", token, user });
  } catch (err) {
    next(err);
  }
});

// เข้าสู่ระบบ
router.post("/login", async (req, res, next) => {
  try {
    const email = (req.body.email ?? "").trim().toLowerCase();
    const password = req.body.password ?? "";

    if (!email || !password) {
      res.status(400).json({ message: "กรุณากรอก email และ password" });
      return;
    }

    const user = await dbClient.query.userTable.findFirst({
      where: eq(userTable.email, email),
    });

    // ตอบข้อความเดียวกันทั้งกรณีไม่เจออีเมลและรหัสผิด
    // เพื่อไม่ให้คนร้ายรู้ว่าอีเมลไหนมีอยู่ในระบบ
    if (!user) {
      res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
      return;
    }

    const token = createToken({ userId: user.id, email: user.email });

    res.json({
      msg: "Login successfully",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

// ดูข้อมูลผู้ใช้ปัจจุบัน (ต้องล็อกอินก่อน)
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;

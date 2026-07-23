import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// บอก TypeScript ว่า req จะมี field ชื่อ user เพิ่มเข้ามา
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string };
    }
  }
}

export type JwtPayload = {
  userId: string;
  email: string;
};

// ด่านตรวจ token — ต้องผ่านก่อนถึงจะเข้า route ที่ป้องกันไว้ได้
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "token ไม่ถูกต้องหรือหมดอายุ" });
  }
}

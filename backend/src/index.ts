import "dotenv/config";
import { dbClient } from "@db/client.js";
import { todoTable } from "@db/schema.js";
import authRouter from "@src/routes/auth.js";
import { requireAuth } from "@src/middleware/auth.js";
import cors from "cors";
import Debug from "debug";
import { and, eq, gte, lte } from "drizzle-orm";
import type { ErrorRequestHandler } from "express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
const debug = Debug("pf-backend");

//Intializing the express app
const app = express();

//Middleware
app.use(morgan("dev", { immediate: false }));
app.use(helmet());
app.use(
  cors({
    origin: false, // Disable CORS
    // origin: "*", // Allow all origins
  }),
);
// Extracts the entire body portion of an incoming request stream and exposes it on req.body.
app.use(express.json());

// Auth routes (register / login / me)
app.use("/auth", authRouter);

// ทุก route ของ /todo ต้องล็อกอินก่อน
app.use("/todo", requireAuth);

// Query — เห็นเฉพาะงานของตัวเอง
app.get("/todo", async (req, res, next) => {
  try {
    const results = await dbClient.query.todoTable.findMany({
      where: eq(todoTable.userId, req.user!.userId),
    });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// ดึงงานตามช่วงเดือน สำหรับแสดงในปฏิทิน
//ใหม่: เพิ่ม query param month และ year เพื่อดึงงานตามเดือนและปีที่ระบุ
app.get("/todo/calendar", async (req, res, next) => {
  try {
    const month = Number(req.query.month); // 1-12
    const year = Number(req.query.year);

    if (!month || !year || month < 1 || month > 12) {
      throw new Error("กรุณาระบุ month (1-12) และ year ให้ถูกต้อง");
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 1)); // วันแรกของเดือนถัดไป (exclusive)

    const results = await dbClient.query.todoTable.findMany({
      where: and(
        eq(todoTable.userId, req.user!.userId),
        gte(todoTable.dueDate, startDate),
        lte(todoTable.dueDate, endDate),
      ),
    });

    res.json({ msg: "ok", data: results });
  } catch (err) {
    next(err);
  }
});

// Insert
app.put("/todo", async (req, res, next) => {
  try {
    const todoText = req.body.todoText ?? "";
    const description = req.body.description ?? null; //<-- เพิ่มdescription
    const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null; //<-- เพิ่มdueDate

    if (!todoText) throw new Error("Empty todoText");
    if (req.body.dueDate && isNaN(dueDate!.getTime())) {
      throw new Error("Invalid dueDate");
    }

    const result = await dbClient
      .insert(todoTable)
      .values({
        todoText,
        description,
        dueDate,
        userId: req.user!.userId,
      })
      .returning({
        id: todoTable.id,
        todoText: todoTable.todoText,
        description: todoTable.description,
        dueDate: todoTable.dueDate,
        isDone: todoTable.isDone,
      });
    res.json({ msg: `Insert successfully`, data: result[0] });
  } catch (err) {
    next(err);
  }
});

// Update
app.patch("/todo", async (req, res, next) => {
  try {
    const id = req.body.id ?? "";
    const todoText = req.body.todoText ?? "";

    if (!todoText || !id) throw new Error("Empty todoText or id");

    // undefined = ไม่แตะ field นี้, null = ล้างค่าทิ้ง
    const description: string | null | undefined = req.body.description;
    const dueDate: Date | null | undefined =
      req.body.dueDate !== undefined
        ? req.body.dueDate === null
          ? null
          : new Date(req.body.dueDate)
        : undefined;

    if (dueDate && isNaN(dueDate.getTime())) throw new Error("Invalid dueDate");

    // เช็คว่ามีงานนี้จริง และเป็นของผู้ใช้คนนี้
    const results = await dbClient.query.todoTable.findMany({
      where: and(
        eq(todoTable.id, id),
        eq(todoTable.userId, req.user!.userId),
      ),
    });
    if (results.length === 0) throw new Error("Invalid id");

    const updateValues: Partial<typeof todoTable.$inferInsert> = { todoText };
    if (description !== undefined) updateValues.description = description;
    if (dueDate !== undefined) updateValues.dueDate = dueDate;

    const result = await dbClient
      .update(todoTable)
      .set(updateValues)
      .where(
        and(eq(todoTable.id, id), eq(todoTable.userId, req.user!.userId)),
      )
      .returning({
        id: todoTable.id,
        todoText: todoTable.todoText,
        description: todoTable.description,
        dueDate: todoTable.dueDate,
        isDone: todoTable.isDone,
      });
    res.json({ msg: `Update successfully`, data: result });
  } catch (err) {
    next(err);
  }
});

// Delete
app.delete("/todo", async (req, res, next) => {
  try {
    const id = req.body.id ?? "";
    if (!id) throw new Error("Empty id");

    // เช็คว่ามีงานนี้จริง และเป็นของผู้ใช้คนนี้
    const results = await dbClient.query.todoTable.findMany({
      where: and(
        eq(todoTable.id, id),
        eq(todoTable.userId, req.user!.userId),
      ),
    });
    if (results.length === 0) throw new Error("Invalid id");

    await dbClient
      .delete(todoTable)
      .where(
        and(eq(todoTable.id, id), eq(todoTable.userId, req.user!.userId)),
      );
    res.json({
      msg: `Delete successfully`,
      data: { id },
    });
  } catch (err) {
    next(err);
  }
});

// ลบงานทั้งหมดของตัวเอง
app.post("/todo/all", async (req, res, next) => {
  try {
    await dbClient
      .delete(todoTable)
      .where(eq(todoTable.userId, req.user!.userId));
    res.json({
      msg: `Delete all rows successfully`,
      data: {},
    });
  } catch (err) {
    next(err);
  }
});

// JSON Error Middleware
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  debug(err.message);
  const errorResponse = {
    message: err.message || "Internal Server Error",
    type: err.name || "Error",
    stack: err.stack,
  };
  res.status(500).send(errorResponse);
};
app.use(jsonErrorHandler);

// Running app
const PORT = process.env.PORT || 3000;
// * Running app
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
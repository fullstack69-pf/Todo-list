import "dotenv/config";
import { dbClient } from "@db/client.js";
import { todoTable } from "@db/schema.js";
import authRouter from "@src/routes/auth.js";
import { requireAuth } from "@src/middleware/auth.js";
import cors from "cors";
import Debug from "debug";
import { and, eq } from "drizzle-orm";
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

// Insert
app.put("/todo", async (req, res, next) => {
  try {
    const todoText = req.body.todoText ?? "";
    if (!todoText) throw new Error("Empty todoText");
    const result = await dbClient
      .insert(todoTable)
      .values({
        todoText,
        userId: req.user!.userId,
      })
      .returning({ id: todoTable.id, todoText: todoTable.todoText });
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

    // เช็คว่ามีงานนี้จริง และเป็นของผู้ใช้คนนี้
    const results = await dbClient.query.todoTable.findMany({
      where: and(
        eq(todoTable.id, id),
        eq(todoTable.userId, req.user!.userId),
      ),
    });
    if (results.length === 0) throw new Error("Invalid id");

    const result = await dbClient
      .update(todoTable)
      .set({ todoText })
      .where(
        and(eq(todoTable.id, id), eq(todoTable.userId, req.user!.userId)),
      )
      .returning({ id: todoTable.id, todoText: todoTable.todoText });
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

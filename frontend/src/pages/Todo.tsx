import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { type TodoItem } from "../types";
import { clearToken } from "../lib/auth";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Bangkok";
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [current, setCurrent] = useState<Dayjs>(dayjs().tz(TZ));
  const [selected, setSelected] = useState<string>(
    dayjs().tz(TZ).format("YYYY-MM-DD"),
  );
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();

  // แปลงเวลาจาก dueDate เป็นข้อความ เช่น "9:00 AM"
  function timeLabel(dueDate?: string | null) {
    if (!dueDate) return "No time set";
    const d = dayjs(dueDate).tz(TZ);
    if (d.hour() === 0 && d.minute() === 0) return "No time set";
    return d.format("h:mm A");
  }

  async function fetchData() {
    const res = await axios.get<TodoItem[]>("/api/todo");
    setTodos(res.data);
  }
  useEffect(() => {
    fetchData();
  }, []);

  // งานของวันที่ระบุ (เทียบด้วย dueDate)
  function todosOn(iso: string) {
    return todos.filter(
      (t) =>
        t.dueDate && dayjs(t.dueDate).tz(TZ).format("YYYY-MM-DD") === iso,
    );
  }

  const today = dayjs().tz(TZ).format("YYYY-MM-DD");
  const selectedIsPast = dayjs(selected).isBefore(today, "day");
  const selectedTasks = todosOn(selected);

  async function handleSubmit() {
    if (!title.trim()) return;
    if (selectedIsPast) {
      alert("สร้างงานย้อนหลังไม่ได้");
      return;
    }
    if (!time) {
      alert("กรุณาเลือกเวลาก่อนสร้างงาน");
      return;
    }
    // รวมวันที่เลือก + เวลา
    const dueDate = `${selected}T${time}`;
    try {
      if (editingId) {
        await axios.patch("/api/todo", {
          id: editingId,
          todoText: title.trim(),
          dueDate,
        });
      } else {
        await axios.put("/api/todo", {
          todoText: title.trim(),
          dueDate,
        });
      }
      setTitle("");
      setTime("");
      setEditingId(null);
      await fetchData();
    } catch (err) {
      alert(err);
    }
  }

  async function handleToggle(t: TodoItem) {
    // อัปเดตหน้าจอทันที (optimistic) ไม่รอ refetch เพราะ backend ยังไม่คืน isDone
    setTodos((prev) =>
      prev.map((x) => (x.id === t.id ? { ...x, isDone: !x.isDone } : x)),
    );
    try {
      await axios.patch("/api/todo", {
        id: t.id,
        todoText: t.todoText,
        isDone: !t.isDone,
      });
    } catch (err) {
      // ถ้าพลาด ย้อนกลับ
      setTodos((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, isDone: t.isDone } : x)),
      );
      alert(err);
    }
  }

  async function handleDelete(id: string) {
    await axios.delete("/api/todo", { data: { id } });
    if (editingId === id) {
      setEditingId(null);
      setTitle("");
    }
    await fetchData();
  }

  function startEdit(t: TodoItem) {
    setEditingId(t.id);
    setTitle(t.todoText);
    // เติมเวลาเดิมถ้ามี
    if (t.dueDate) {
      const d = dayjs(t.dueDate).tz(TZ);
      setTime(d.hour() === 0 && d.minute() === 0 ? "" : d.format("HH:mm"));
    } else {
      setTime("");
    }
  }

  // สร้างช่องปฏิทิน 42 ช่อง (6 สัปดาห์)
  const startOfGrid = current.startOf("month").startOf("week");
  const cells: Dayjs[] = Array.from({ length: 42 }, (_, i) =>
    startOfGrid.add(i, "day"),
  );

  return (
    <div className="planner">
      <header className="planner-header">
        <h1>What are you planning to do next?</h1>
        <button
          className="secondary"
          onClick={() => {
            clearToken();
            navigate("/login");
          }}
        >
          Sign out
        </button>
      </header>

      <div className="planner-grid">
        {/* ===== ซ้าย: ปฏิทิน ===== */}
        <section className="planner-cal">
          <div className="cal-header">
            <h2>{current.format("MMMM YYYY")}</h2>
            <div className="cal-nav">
              <button
                className="secondary"
                onClick={() => setCurrent(current.subtract(1, "month"))}
              >
                ‹
              </button>
              <button
                className="secondary"
                onClick={() => setCurrent(dayjs().tz(TZ))}
              >
                Today
              </button>
              <button
                className="secondary"
                onClick={() => setCurrent(current.add(1, "month"))}
              >
                ›
              </button>
            </div>
          </div>

          <div className="cal-grid">
            {WEEKDAYS.map((w) => (
              <div key={w} className="cal-weekday">
                {w}
              </div>
            ))}

            {cells.map((day) => {
              const iso = day.format("YYYY-MM-DD");
              const items = todosOn(iso);
              const isToday = iso === today;
              const isOtherMonth = !day.isSame(current, "month");
              const isPast = day.isBefore(dayjs().tz(TZ), "day");
              const isSelected = iso === selected;

              return (
                <div
                  key={iso}
                  className={[
                    "cal-cell",
                    isOtherMonth ? "other-month" : "",
                    isToday ? "today" : "",
                    isPast ? "past" : "",
                    isSelected ? "selected" : "",
                  ].join(" ")}
                  onClick={() => setSelected(iso)}
                  data-cy="calendar-cell"
                >
                  <span className="cal-date">{day.date()}</span>
                  <div className="cal-markers">
                    {items.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        className={`cal-marker ${t.isDone ? "done" : ""}`}
                        title={t.todoText}
                      >
                        {t.todoText}
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="cal-more">+{items.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== ขวา: งานของวันที่เลือก ===== */}
        <aside className="planner-side">
          <div className="side-head">
            <div className="side-weekday">
              {dayjs(selected).format("dddd")}
            </div>
            <div className="side-date">
              {dayjs(selected).format("MMMM D")}
            </div>
            <div className="side-summary">
              {selectedTasks.length === 0
                ? "Nothing scheduled"
                : `${selectedTasks.filter((t) => t.isDone).length} of ${selectedTasks.length} done`}
            </div>
          </div>

          {!selectedIsPast && (
            <div className="side-add">
              <input
                className="side-add-title"
                placeholder={editingId ? "Edit task…" : "Add a task…"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                data-cy="input-text"
              />
              <div className="side-add-actions">
                <div className="due-field">
                  <span>Due</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
                {editingId && (
                  <button
                    className="secondary"
                    onClick={() => {
                      setEditingId(null);
                      setTitle("");
                      setTime("");
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!title.trim() || !time}
                  data-cy="submit"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </div>
          )}

          <div className="side-list" data-cy="todo-item-wrapper">
            {selectedTasks.length === 0 ? (
              <div className="side-empty">
                <div>◔</div>
                <p>No tasks yet</p>
              </div>
            ) : (
              selectedTasks.map((t) => (
                <div
                  key={t.id}
                  className={`task-row ${t.isDone ? "done" : ""}`}
                >
                  <button
                    className="task-check"
                    onClick={() => handleToggle(t)}
                  >
                    {t.isDone ? "✓" : ""}
                  </button>
                  <div className="task-main">
                    <span className="task-title" data-cy="todo-item-text">
                      {t.todoText}
                    </span>
                    <span className="task-time">{timeLabel(t.dueDate)}</span>
                  </div>
                  <button
                    className="task-edit"
                    onClick={() => startEdit(t)}
                    data-cy="todo-item-update"
                  >
                    Edit
                  </button>
                  <button
                    className="task-del"
                    onClick={() => handleDelete(t.id)}
                    data-cy="todo-item-delete"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Todo;

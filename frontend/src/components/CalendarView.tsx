import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { type TodoItem } from "../types";


dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Bangkok";
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];


type CalendarViewProps = {
  todos: TodoItem[];
  onSelectDate?: (date: string) => void;
};

function CalendarView({ todos, onSelectDate }: CalendarViewProps) {
  const [current, setCurrent] = useState<Dayjs>(dayjs().tz(TZ));

  // สร้างช่องวันที่ 42 ช่อง (6 สัปดาห์) เริ่มจากวันอาทิตย์
  const startOfGrid = current.startOf("month").startOf("week");
  const cells: Dayjs[] = Array.from({ length: 42 }, (_, i) =>
    startOfGrid.add(i, "day"),
  );

  // หางานที่ครบกำหนดในวันนั้น
  function todosOn(day: Dayjs) {
    return todos.filter((t) => {
      const target = t.dueDate ?? t.createdAt;
      return dayjs(target).tz(TZ).isSame(day, "day");
    });
  }

  return (
    <section className="calendar">
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
          const items = todosOn(day);
          const isToday = day.isSame(dayjs().tz(TZ), "day");
          const isOtherMonth = !day.isSame(current, "month");
          const isPast = day.isBefore(dayjs().tz(TZ), "day");

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={[
                "cal-cell",
                isOtherMonth ? "other-month" : "",
                isToday ? "today" : "",
                isPast ? "past" : "",
              ].join(" ")}
              onClick={() => {
                if (isPast) return;
                onSelectDate?.(day.format("YYYY-MM-DD"));
              }}
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
                  <div className="cal-more">+{items.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default CalendarView;
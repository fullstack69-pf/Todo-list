import { useState } from "react";
import dayjs from "dayjs";

type EventModalProps = {
  date: string; // วันที่ถูกคลิก (YYYY-MM-DD)
  onClose: () => void;
  onSave: (data: {
    todoText: string;
    description: string;
    dueDate: string;
  }) => Promise<void> | void;
};

function EventModal({ date, onClose, onSave }: EventModalProps) {
  const [todoText, setTodoText] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(date);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!todoText.trim()) return;
    setSaving(true);
    try {
      await onSave({ todoText: todoText.trim(), description, dueDate });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* กันไม่ให้คลิกในการ์ดแล้วปิด modal */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
          <h2>สร้างงานใหม่</h2>
          <span style={{ width: 32 }} />
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="ชื่องาน"
            value={todoText}
            onChange={(e) => setTodoText(e.target.value)}
            autoFocus
            required
            data-cy="event-title"
          />

          <textarea
            placeholder="รายละเอียด (ไม่บังคับ)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            data-cy="event-description"
          />

          <label className="field-row">
            <span>วันที่เขียน</span>
            <input type="date" value={dayjs().format("YYYY-MM-DD")} disabled />
          </label>

          <label className="field-row">
            <span>วันที่ต้องทำเสร็จ</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              data-cy="event-duedate"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" disabled={saving} data-cy="event-save">
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
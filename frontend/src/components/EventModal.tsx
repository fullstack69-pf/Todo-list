import { useState } from "react";
import dayjs from "dayjs";

type EventModalProps = {
  date: string; // clicked date (YYYY-MM-DD)
  onClose: () => void;
  onSave: (data: {
    todoText: string;
    description: string;
    dueDate: string;
  }) => Promise<void> | void;
};

function EventModal({ date, onClose, onSave }: EventModalProps) {
  const today = dayjs().format("YYYY-MM-DD");
  // if the clicked date is in the past, start from today instead
  const initialDue = dayjs(date).isBefore(today, "day") ? today : date;

  const [todoText, setTodoText] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(initialDue);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!todoText.trim()) {
      setError("Please enter an event title");
      return;
    }
    // block past dates
    if (dayjs(dueDate).isBefore(today, "day")) {
      setError("Cannot create an event in the past");
      return;
    }
    setError("");
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Event</h2>
          <button type="button" className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Title</span>
            <input
              type="text"
              placeholder="Event Title"
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              autoFocus
              data-cy="event-title"
            />
          </label>

          <label className="field">
            <span className="field-label">Description (Optional)</span>
            <textarea
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              data-cy="event-description"
            />
          </label>

          <div className="field-grid">
            <label className="field">
              <span className="field-label">Created Date</span>
              <input type="date" value={today} disabled />
            </label>

            <label className="field">
              <span className="field-label">Due Date</span>
              <input
                type="date"
                value={dueDate}
                min={today} /* can't pick past dates */
                onChange={(e) => setDueDate(e.target.value)}
                data-cy="event-duedate"
              />
            </label>
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving} data-cy="event-save">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
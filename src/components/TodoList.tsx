import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { FormField, Priority, Todo } from "../types";

export type TodoDraft = Omit<Todo, "id" | "createdAt">;

export interface TodoListProps<T extends Todo> {
  items: T[];
  onToggle: (id: T["id"], completed: boolean) => void;
  onDelete: (id: T["id"]) => void;
  onAdd: (draft: TodoDraft) => T;
  emptyMessage?: string;
}

const SEARCH_FIELD: FormField<string> = {
  label: "بحث",
  value: "",
  touched: false,
  required: false,
  placeholder: "ابحث بالعنوان أو الوسم...",
  type: "text",
};

const PRIORITIES: Priority[] = ["low", "medium", "high"];

const PRIORITY_LABEL: Record<Priority, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
};

function matches(todo: Todo, query: string): boolean {
  if (!query) return true;
  const needle = query.toLowerCase();
  const inTitle = todo.title.toLowerCase().includes(needle);
  const inTags = (todo.tags ?? []).some((tag) => tag.toLowerCase().includes(needle));
  const inAssignee = todo.assignee?.name.toLowerCase().includes(needle) ?? false;
  return inTitle || inTags || inAssignee;
}

export default function TodoList<T extends Todo>({
  items,
  onToggle,
  onDelete,
  onAdd,
  emptyMessage = "لا توجد مهام",
}: TodoListProps<T>) {
  const [query, setQuery] = useState<string>(SEARCH_FIELD.value);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [filter, setFilter] = useState<Priority | "all">("all");

  const visible = useMemo(
    () =>
      items.filter(
        (todo) =>
          (filter === "all" || todo.priority === filter) && matches(todo, query.trim()),
      ),
    [filter, items, query],
  );

  const handleAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    onAdd({
      title: cleanTitle,
      completed: false,
      priority,
      status: "active",
    });

    setTitle("");
  };

  return (
    <section className="card">
      <h2>TodoList (Generic &lt;T extends Todo&gt;)</h2>

      <label className="field">
        <span>{SEARCH_FIELD.label}</span>
        <input
          type={SEARCH_FIELD.type}
          value={query}
          placeholder={SEARCH_FIELD.placeholder}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="row">
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          الكل
        </button>
        {PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            className={filter === p ? "active" : ""}
            onClick={() => setFilter(p)}
          >
            {PRIORITY_LABEL[p]}
          </button>
        ))}
      </div>

      <form className="row" onSubmit={handleAdd}>
        <input
          type="text"
          value={title}
          placeholder="مهمة جديدة"
          onChange={(event) => setTitle(event.target.value)}
        />
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as Priority)}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
        <button type="submit">إضافة</button>
      </form>

      {visible.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <ul className="todo-list">
          {visible.map((todo) => (
            <li key={todo.id} className={todo.completed ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={(event) => onToggle(todo.id, event.target.checked)}
                />
                <span>
                  {todo.title}
                  <em className={`badge priority-${todo.priority}`}>
                    {PRIORITY_LABEL[todo.priority]}
                  </em>
                  {todo.assignee && <small> — {todo.assignee.name}</small>}
                </span>
              </label>
              <button type="button" onClick={() => onDelete(todo.id)} aria-label="حذف">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="muted">
        {visible.length} / {items.length}
      </p>
    </section>
  );
}

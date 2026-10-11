import { useCallback, useMemo, useState } from "react";
import Counter from "./components/Counter";
import TodoList from "./components/TodoList";
import type { TodoDraft } from "./components/TodoList";
import UserCard from "./components/UserCard";
import UserForm from "./components/UserForm";
import { useDebounce } from "./hooks/useDebounce";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Todo, User } from "./types";

const SAMPLE_USER: User = {
  id: "u-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  age: 36,
  role: "admin",
  createdAt: "2026-01-01T00:00:00.000Z",
};

const SAMPLE_TODOS: Todo[] = [
  {
    id: "t-1",
    title: "تصميم Counter بـ useReducer",
    completed: true,
    priority: "high",
    status: "done",
    assignee: SAMPLE_USER,
    tags: ["react", "typescript"],
    createdAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "t-2",
    title: "كتابة useForm مع تحقق الأنواع",
    completed: false,
    priority: "medium",
    status: "active",
    tags: ["forms"],
    createdAt: "2026-01-03T00:00:00.000Z",
  },
];

export default function App() {
  const [users, setUsers] = useLocalStorage<User[]>("tsrc.users", [SAMPLE_USER]);
  const [todos, setTodos] = useLocalStorage<Todo[]>("tsrc.todos", SAMPLE_TODOS);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);

  const visibleUsers = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle),
    );
  }, [debouncedSearch, users]);

  const handleAddUser = useCallback(
    (user: User) => setUsers((prev) => [user, ...prev]),
    [setUsers],
  );

  const handleAddTodo = useCallback(
    (draft: TodoDraft): Todo => {
      const todo: Todo = {
        ...draft,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setTodos((prev) => [todo, ...prev]);
      return todo;
    },
    [setTodos],
  );

  const handleToggleTodo = useCallback(
    (id: string, completed: boolean) =>
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id
            ? { ...todo, completed, status: completed ? "done" : "active" }
            : todo,
        ),
      ),
    [setTodos],
  );

  const handleDeleteTodo = useCallback(
    (id: string) => setTodos((prev) => prev.filter((todo) => todo.id !== id)),
    [setTodos],
  );

  return (
    <main className="app">
      <header>
        <h1>Type-Safe React Components</h1>
        <p className="muted">
          Hooks + Generics + useReducer — كل الأنواع في src/types/index.ts
        </p>
      </header>

      <Counter initialCount={0} step={1} min={-20} max={100} />

      <UserForm onSubmit={handleAddUser} />

      <section className="card">
        <h2>Users ({visibleUsers.length})</h2>
        <label className="field">
          <span>بحث مؤجل 250ms</span>
          <input
            type="search"
            value={search}
            placeholder="ابحث بالاسم أو البريد"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {visibleUsers.length === 0 ? (
          <p className="muted">لا يوجد مستخدمون مطابقون</p>
        ) : (
          visibleUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              showEmail
              onContact={(target) => alert(`تواصل مع ${target.name}`)}
              onDelete={(id) => setUsers((prev) => prev.filter((u) => u.id !== id))}
            />
          ))
        )}
      </section>

      <TodoList
        items={todos}
        onToggle={handleToggleTodo}
        onDelete={handleDeleteTodo}
        onAdd={handleAddTodo}
      />
    </main>
  );
}

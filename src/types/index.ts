export type Priority = "low" | "medium" | "high";

export type Status = "idle" | "active" | "done";

export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  role?: "admin" | "editor" | "viewer";
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  status: Status;
  assignee?: User;
  dueDate?: string;
  tags?: string[];
  createdAt: string;
}

export interface FormField<T> {
  label: string;
  value: T;
  error?: string;
  touched: boolean;
  required: boolean;
  placeholder?: string;
  type: "text" | "email" | "number" | "checkbox" | "date" | "textarea" | "select";
  options?: { label: string; value: string }[];
}

export type Validator<T> = (values: T) => Partial<Record<keyof T, string>>;

export type FormErrors<T> = Partial<Record<keyof T, string>>;

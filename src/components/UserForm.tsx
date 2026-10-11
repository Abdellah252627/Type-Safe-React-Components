import { useMemo, useState } from "react";
import { useForm } from "../hooks/useForm";
import type { FormErrors, User } from "../types";

type UserRole = NonNullable<User["role"]>;

interface UserFormValues {
  name: string;
  email: string;
  age: number;
  role: UserRole;
}

interface UserFormProps {
  onSubmit: (user: User) => void;
  initialUser?: Partial<User>;
}

const EMPTY_VALUES: UserFormValues = {
  name: "",
  email: "",
  age: 18,
  role: "viewer",
};

const ROLES: { label: string; value: string }[] = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const validateUserForm = (values: UserFormValues): FormErrors<UserFormValues> => {
  const errors: FormErrors<UserFormValues> = {};

  if (!values.name.trim()) errors.name = "الاسم مطلوب";
  else if (values.name.trim().length < 2) errors.name = "الاسم قصير جداً";

  if (!values.email.trim()) errors.email = "البريد مطلوب";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "صيغة البريد غير صحيحة";

  if (!Number.isFinite(values.age)) errors.age = "العمر مطلوب";
  else if (values.age < 18) errors.age = "العمر يجب أن يكون 18 أو أكثر";
  else if (values.age > 120) errors.age = "العمر يجب أن يكون 120 أو أقل";

  if (!values.role) errors.role = "الدور مطلوب";

  return errors;
};

export default function UserForm({ onSubmit, initialUser }: UserFormProps) {
  const initialValues = useMemo<UserFormValues>(
    () => ({
      name: initialUser?.name ?? EMPTY_VALUES.name,
      email: initialUser?.email ?? EMPTY_VALUES.email,
      age: initialUser?.age ?? EMPTY_VALUES.age,
      role: (initialUser?.role as UserRole | undefined) ?? EMPTY_VALUES.role,
    }),
    [initialUser],
  );

  const [saved, setSaved] = useState<string | null>(null);

  const { values, errors, touched, isSubmitting, handleChangeEvent, handleBlur, handleSubmit, reset } =
    useForm<UserFormValues>(initialValues, validateUserForm, (form) => {
      onSubmit({
        id: crypto.randomUUID(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        age: form.age,
        role: form.role,
        createdAt: new Date().toISOString(),
      });
      setSaved(form.email.trim().toLowerCase());
    });

  const errorFor = (field: keyof UserFormValues): string | undefined =>
    touched[field] ? errors[field] : undefined;

  return (
    <section className="card">
      <h2>UserForm (useForm + Typed Validation)</h2>
      <form noValidate onSubmit={handleSubmit}>
        <label className="field">
          <span>الاسم</span>
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChangeEvent("name")}
            onBlur={() => handleBlur("name")}
            placeholder="Ada Lovelace"
          />
          {errorFor("name") && <small className="error">{errorFor("name")}</small>}
        </label>

        <label className="field">
          <span>البريد الإلكتروني</span>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChangeEvent("email")}
            onBlur={() => handleBlur("email")}
            placeholder="ada@example.com"
          />
          {errorFor("email") && <small className="error">{errorFor("email")}</small>}
        </label>

        <label className="field">
          <span>العمر</span>
          <input
            type="number"
            name="age"
            value={values.age}
            onChange={handleChangeEvent("age")}
            onBlur={() => handleBlur("age")}
          />
          {errorFor("age") && <small className="error">{errorFor("age")}</small>}
        </label>

        <label className="field">
          <span>الدور</span>
          <select
            name="role"
            value={values.role}
            onChange={handleChangeEvent("role")}
            onBlur={() => handleBlur("role")}
          >
            {ROLES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errorFor("role") && <small className="error">{errorFor("role")}</small>}
        </label>

        <div className="row">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
          </button>
          <button type="button" onClick={() => { reset(); setSaved(null); }}>
            مسح
          </button>
        </div>
      </form>
      {saved && <p className="success">تم حفظ: {saved}</p>}
    </section>
  );
}

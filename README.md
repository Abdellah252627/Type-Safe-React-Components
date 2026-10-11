# Type-Safe React Components

مشروع React + TypeScript يوضح مكونات وآليات كتابة نوعية (type-safe) باستخدام:

- **Generics** للمكونات والخطافات (hooks)
- **Discriminated Unions** في `useReducer`
- **Typed Forms** مع تحقق كامل الأنواع
- **Strict TypeScript** (`noUncheckedIndexedAccess`، `exactOptionalPropertyTypes`)

## الهيكل

```
src/
├── types/
│   └── index.ts          # كل الأنواع المشتركة
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   └── useForm.ts        # Generic form hook
├── components/
│   ├── Counter.tsx       # useReducer مع types
│   ├── UserForm.tsx      # Typed form + validation
│   ├── TodoList.tsx      # Generic component <T extends Todo>
│   └── UserCard.tsx      # Typed props مع optional callbacks
└── App.tsx               # يربط كل شيء
```

## الأنواع الأساسية (`src/types/index.ts`)

| نوع | وصف |
|------|------|
| `User` | معرف، اسم، بريد، عمر، دور، تاريخ الإنشاء |
| `Todo` | معرف، عنوان، مكتمل، أولوية، حالة، مسؤول، تاريخ استحقاق، وسوم |
| `Priority` | `"low" \| "medium" \| "high"` |
| `Status` | `"idle" \| "active" \| "done"` |
| `FormField<T>` | حقل نموذج كامل (label، value، error، touched، required، type، options…) |
| `Validator<T>` | دالة تحقق ترجع `Partial<Record<keyof T, string>>` |
| `FormErrors<T>` | أخطاء النموذج |

## الخطافات (Hooks)

### `useForm<T>(initialValues, validate?, onSubmit?)`

```ts
const { values, errors, touched, isSubmitting, isValid,
        handleChange, handleChangeEvent, handleBlur,
        handleSubmit, reset, setValues } = useForm(initialValues, validate, onSubmit);
```

- تحقق متأخر (على `blur` و submit)
- `handleChangeEvent(field)` يرجع handler مناسب لـ `onChange`
- `isValid` يحسب ديناميكياً من دالة التحقق

### `useLocalStorage<T>(key, initialValue)`

يرجع `[value, setValue, remove]` — يقرأ/يكتب JSON بأمان.

### `useDebounce<T>(value, delay?)`

يرجع القيمة بعد `delay` ميلي ثانية (افتراضي 300ms).

## المكونات

### `Counter`
```tsx
<Counter initialCount={0} step={1} min={-20} max={100} />
```
- `useReducer` مع `CounterAction` (INCREMENT, DECREMENT, RESET, SET_STEP)
- يحترم `min`/`max` عبر دالة `clamp`

### `UserForm`
```tsx
<UserForm onSubmit={(user) => console.log(user)} initialUser={{ name: "..." }} />
```
- حقول: الاسم، البريد، العمر، الدور (select)
- تحقق: مطلوب، صيغة بريد، عمر ≥ 18، دور مطلوب
- يستخدم `useForm` مع `validateUserForm`

### `TodoList<T extends Todo>`
```tsx
<TodoList
  items={todos}
  onToggle={(id, completed) => ...}
  onDelete={(id) => ...}
  onAdd={(draft) => newTodo}
/>
```
- Generic على `T extends Todo`
- بحث نصي + فلترة بأولوية (أزرار)
- نموذج إضافة: عنوان + أولوية

### `UserCard`
```tsx
<UserCard
  user={user}
  showEmail={true}
  onContact={(user) => ...}
  onDelete={(id) => ...}
/>
```
- يعرض الأحرف الأولى في `avatar`
- أزرار اختيارية: تواصل، نسخ البريد، حذف

## التشغيل

```bash
# تثبيت التبعيات
npm install

# التطوير
npm run dev        # http://localhost:5173

# فحص الأنواع
npm run typecheck  # tsc -b --noEmit (strict mode)

# بناء الإنتاج
npm run build      # tsc -b && vite build
```

## إعدادات TypeScript الصارمة

`tsconfig.app.json` يفعل:
- `strict: true`
- `noUncheckedIndexedAccess: true`
- `noUnusedLocals/Parameters: true`
- `exactOptionalPropertyTypes: false` (للتوافق مع React)

## ملاحظات

- RTL + لغة عربية في الواجهة
- البيانات محفوظة في `localStorage` عبر `useLocalStorage`
- البحث في قائمة المستخدمين يستخدم `useDebounce(250ms)`
- لا توجد مكتبات خارجية للنماذج أو الحالة — كود نقي التعليمي
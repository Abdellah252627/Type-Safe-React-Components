import { useCallback, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { FormErrors, Validator } from "../types";

export interface UseFormResult<T> {
  values: T;
  errors: FormErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  handleChangeEvent: <K extends keyof T>(field: K) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: <K extends keyof T>(field: K) => void;
  handleSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  reset: (nextValues?: T) => void;
  setValues: (updater: (prev: T) => T) => void;
}

const noValidate = <T,>(_values: T): FormErrors<T> => ({});

export function useForm<T extends object>(
  initialValues: T,
  validate: Validator<T> = noValidate,
  onSubmit?: (values: T) => void | Promise<void>,
): UseFormResult<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const runValidation = useCallback(
    (next: T): FormErrors<T> => {
      const result = validate(next);
      return Object.fromEntries(
        Object.entries(result).filter(([, message]) => Boolean(message)),
      ) as FormErrors<T>;
    },
    [validate],
  );

  const handleChange = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValuesState((prev) => {
        const next: T = { ...prev, [field]: value };
        setErrors((prevErrors) => {
          if (!touched[field as keyof T] && !prevErrors[field as keyof T]) return prevErrors;
          return { ...prevErrors, [field]: runValidation(next)[field as keyof T] };
        });
        return next;
      });
    },
    [runValidation, touched],
  );

  const handleChangeEvent = useCallback(
    <K extends keyof T>(field: K) =>
      (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = event.target;
        let nextValue: T[K];

        if (target instanceof HTMLInputElement) {
          if (target.type === "checkbox") nextValue = target.checked as T[K];
          else if (target.type === "number") nextValue = Number(target.value) as T[K];
          else nextValue = target.value as T[K];
        } else {
          nextValue = target.value as T[K];
        }

        handleChange(field, nextValue);
      },
    [handleChange],
  );

  const handleBlur = useCallback(
    <K extends keyof T>(field: K) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setValuesState((prev) => {
        const nextErrors = runValidation(prev);
        setErrors((prevErrors) => ({ ...prevErrors, [field]: nextErrors[field] }));
        return prev;
      });
    },
    [runValidation],
  );

  const handleSubmit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      const nextErrors = runValidation(values);
      const hasErrors = Object.values(nextErrors).some(Boolean);

      setErrors(nextErrors);
      setTouched(
        Object.keys(values).reduce<Partial<Record<keyof T, boolean>>>((acc, key) => {
          acc[key as keyof T] = true;
          return acc;
        }, {}),
      );

      if (hasErrors) return;

      setIsSubmitting(true);
      void Promise.resolve(onSubmit?.(values)).finally(() => setIsSubmitting(false));
    },
    [onSubmit, runValidation, values],
  );

  const reset = useCallback((nextValues?: T) => {
    setValuesState(nextValues ?? initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setValues = useCallback((updater: (prev: T) => T) => {
    setValuesState(updater);
  }, []);

  const isValid = useMemo(
    () => !Object.values(runValidation(values)).some(Boolean),
    [runValidation, values],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleChangeEvent,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
  };
}

import { forwardRef, useId, type InputHTMLAttributes } from 'react';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, id, ...inputProps },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [hint && !error ? hintId : null, error ? errorId : null]
    .filter((value) => value !== null)
    .join(' ');

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldId}
        className="font-body text-xs font-medium tracking-widest text-ink uppercase dark:text-bone"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="font-body border-b border-ink/50 bg-transparent py-2 text-sm text-ink outline-none focus-visible:border-field-magenta dark:border-bone/40 dark:text-bone dark:focus-visible:border-field-cyan"
        {...inputProps}
      />
      {hint && !error ? (
        <p id={hintId} className="font-body text-xs text-ink/70 dark:text-bone/70">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="font-body text-xs text-ink/80 dark:text-bone/80">
          {error}
        </p>
      ) : null}
    </div>
  );
});

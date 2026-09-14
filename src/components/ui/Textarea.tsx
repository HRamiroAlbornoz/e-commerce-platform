import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { useFieldDescribedBy } from '@/lib/useFieldDescribedBy';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, id, ...textareaProps },
  ref,
) {
  const { fieldId, hintId, errorId, describedBy } = useFieldDescribedBy(id, hint, error);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={fieldId}
        className="font-body text-xs font-medium tracking-widest text-ink uppercase dark:text-bone"
      >
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="font-body border-b border-ink/50 bg-transparent py-2 text-sm text-ink outline-none focus-visible:border-field-magenta dark:border-bone/40 dark:text-bone dark:focus-visible:border-field-cyan"
        {...textareaProps}
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

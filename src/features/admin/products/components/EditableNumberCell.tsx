import { useState } from 'react';
import { useFieldDescribedBy } from '@/lib/useFieldDescribedBy';

type EditableNumberCellProps = {
  value: number;
  label: string;
  min: number;
  step: number;
  disabled: boolean;
  onSave: (newValue: number) => Promise<number>;
};

export function EditableNumberCell({ value, label, min, step, disabled, onSave }: EditableNumberCellProps) {
  const [draft, setDraft] = useState(String(value));
  const [committed, setCommitted] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { fieldId, errorId, describedBy } = useFieldDescribedBy(undefined, undefined, error ?? undefined);

  async function commit(): Promise<void> {
    const parsed = Number(draft);

    if (!Number.isFinite(parsed) || parsed < min) {
      setDraft(String(committed));
      setError('Ingresá un valor válido.');
      return;
    }

    if (parsed === committed) {
      setError(null);
      return;
    }

    setIsSaving(true);
    try {
      const persistedValue = await onSave(parsed);
      setCommitted(persistedValue);
      setDraft(String(persistedValue));
      setError(null);
    } catch (err) {
      setDraft(String(committed));
      setError(err instanceof Error ? err.message : 'No pudimos guardar el cambio.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <label htmlFor={fieldId} className="sr-only">
        {label}
      </label>
      <input
        id={fieldId}
        type="number"
        min={min}
        step={step}
        value={draft}
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        disabled={disabled || isSaving}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        className="w-24 border-b border-ink/50 bg-transparent py-1 font-body text-sm text-ink tabular-nums outline-none focus-visible:border-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:border-bone/40 dark:text-bone dark:focus-visible:border-field-cyan"
      />
      {error ? (
        <p id={errorId} role="alert" className="font-body text-xs text-ink/80 dark:text-bone/80">
          {error}
        </p>
      ) : null}
    </div>
  );
}

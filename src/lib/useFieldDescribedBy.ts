import { useId } from 'react';

type FieldDescribedBy = {
  fieldId: string;
  hintId: string;
  errorId: string;
  describedBy: string | undefined;
};

export function useFieldDescribedBy(
  explicitId: string | undefined,
  hint: string | undefined,
  error: string | undefined,
): FieldDescribedBy {
  const generatedId = useId();
  const fieldId = explicitId ?? generatedId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const describedBy = [hint && !error ? hintId : null, error ? errorId : null]
    .filter((value) => value !== null)
    .join(' ');

  return { fieldId, hintId, errorId, describedBy: describedBy || undefined };
}

import { Controller, type Control } from 'react-hook-form';
import type { ReviewInput } from '@shared/schemas/review';

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

type RatingInputProps = {
  control: Control<ReviewInput>;
};

export function RatingInput({ control }: RatingInputProps) {
  return (
    <Controller
      name="rating"
      control={control}
      render={({ field }) => (
        <div role="radiogroup" aria-label="Calificación" className="flex gap-2">
          {RATING_VALUES.map((value, index) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name={field.name}
                value={value}
                checked={field.value === value}
                onChange={() => field.onChange(value)}
                onBlur={field.onBlur}
                ref={index === 0 ? field.ref : undefined}
                className="peer sr-only"
              />
              <span className="font-body flex h-10 w-10 items-center justify-center border border-ink/50 text-sm text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-bone peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-field-magenta dark:border-bone/40 dark:text-bone dark:peer-checked:border-bone dark:peer-checked:bg-bone dark:peer-checked:text-ink dark:peer-focus-visible:outline-field-cyan">
                {value}
              </span>
            </label>
          ))}
        </div>
      )}
    />
  );
}

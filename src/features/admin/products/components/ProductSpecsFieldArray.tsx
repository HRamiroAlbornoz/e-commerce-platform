import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { TextField } from '@/components/ui/TextField';
import { InlineError } from '@/components/ui/InlineError';
import type { CreateProductRequest } from '@shared/schemas/product';

const MAX_SPECS = 12;
const MIN_SPECS = 1;

type ProductSpecsFieldArrayProps = {
  control: Control<CreateProductRequest>;
  register: UseFormRegister<CreateProductRequest>;
  errors: FieldErrors<CreateProductRequest>;
};

export function ProductSpecsFieldArray({ control, register, errors }: ProductSpecsFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'specs' });

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="font-body text-xs font-medium tracking-widest text-ink uppercase dark:text-bone">
        Especificaciones
      </legend>

      {fields.map((field, index) => (
        <div key={field.id} className="flex flex-wrap items-end gap-3">
          <TextField
            label="Nombre"
            error={errors.specs?.[index]?.label?.message}
            {...register(`specs.${index}.label` as const)}
          />
          <TextField
            label="Valor"
            error={errors.specs?.[index]?.value?.message}
            {...register(`specs.${index}.value` as const)}
          />
          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length <= MIN_SPECS}
            className="font-body border-b border-ink text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan"
          >
            Quitar
          </button>
        </div>
      ))}

      <InlineError message={errors.specs?.message} />

      <div>
        <button
          type="button"
          onClick={() => append({ label: '', value: '' })}
          disabled={fields.length >= MAX_SPECS}
          className="font-body border-b border-ink text-xs font-medium tracking-widest text-ink uppercase hover:border-field-magenta hover:text-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan"
        >
          Agregar especificación
        </button>
      </div>
    </fieldset>
  );
}

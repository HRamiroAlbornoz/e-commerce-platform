import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PaymentDraft } from '@shared/schemas/checkout';
import { paymentFormSchema, type PaymentFormValues } from '@/features/checkout/schemas/checkoutForms';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';

type PaymentFormProps = {
  defaultValues: PaymentDraft | null;
  onSubmit: (payment: PaymentDraft) => void;
};

export function PaymentForm({ defaultValues, onSubmit }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    mode: 'onTouched',
    defaultValues: {
      cardholderName: defaultValues?.cardholderName ?? '',
      outcome: defaultValues?.outcome ?? 'success',
    },
  });

  function handleValid(values: PaymentFormValues): void {
    onSubmit({ ...values, method: 'card' });
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(handleValid)(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <fieldset disabled={isSubmitting} className="contents">
        <legend className="font-display text-xl text-ink dark:text-bone">Pago</legend>
        <p className="font-body text-xs text-ink/70 dark:text-bone/70">
          Pago simulado: no se procesa ningún cargo real. Elegí un resultado para probar el flujo.
        </p>
        <TextField
          label="Nombre del titular"
          autoComplete="cc-name"
          error={errors.cardholderName?.message}
          {...register('cardholderName')}
        />
        <fieldset className="flex flex-col gap-2">
          <legend className="font-body text-xs font-medium tracking-widest text-ink uppercase dark:text-bone">
            Resultado simulado
          </legend>
          <label className="font-body flex items-center gap-2 text-sm text-ink dark:text-bone">
            <input type="radio" value="success" {...register('outcome')} />
            Aprobado
          </label>
          <label className="font-body flex items-center gap-2 text-sm text-ink dark:text-bone">
            <input type="radio" value="error" {...register('outcome')} />
            Rechazado
          </label>
        </fieldset>
        <InlineError message={errors.outcome?.message} />
        <Button type="submit" isLoading={isSubmitting}>
          Revisar compra
        </Button>
      </fieldset>
    </form>
  );
}

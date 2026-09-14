import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ShippingDetails } from '@shared/schemas/checkout';
import { shippingFormSchema, type ShippingFormValues } from '@/features/checkout/schemas/checkoutForms';
import { TextField } from '@/components/ui/TextField';
import { Button } from '@/components/ui/Button';

type ShippingFormProps = {
  defaultValues: ShippingDetails | null;
  onSubmit: (shipping: ShippingDetails) => void;
};

export function ShippingForm({ defaultValues, onSubmit }: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    mode: 'onTouched',
    ...(defaultValues ? { defaultValues } : {}),
  });

  function handleValid(values: ShippingFormValues): void {
    onSubmit(values);
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(handleValid)(event)}
      noValidate
      className="flex flex-col gap-4"
    >
      <fieldset disabled={isSubmitting} className="contents">
        <legend className="font-display text-xl text-ink dark:text-bone">Envío</legend>
        <TextField
          label="Nombre completo"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <TextField
          label="Dirección"
          autoComplete="street-address"
          error={errors.address?.message}
          {...register('address')}
        />
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <TextField
              label="Ciudad"
              autoComplete="address-level2"
              error={errors.city?.message}
              {...register('city')}
            />
          </div>
          <div className="flex-1">
            <TextField
              label="Código postal"
              autoComplete="postal-code"
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
          </div>
        </div>
        <TextField
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Continuar a pago
        </Button>
      </fieldset>
    </form>
  );
}

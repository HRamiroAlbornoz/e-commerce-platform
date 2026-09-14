import { z } from 'zod';
import { simulatedPaymentOutcomeSchema } from '@shared/schemas/checkout';

export const shippingFormSchema = z.object({
  fullName: z.string().min(1, 'Ingresá el nombre de quien recibe.').max(80),
  address: z.string().min(1, 'Ingresá la dirección.').max(160),
  city: z.string().min(1, 'Ingresá la ciudad.').max(80),
  postalCode: z.string().min(1, 'Ingresá el código postal.').max(20),
  phone: z.string().min(1, 'Ingresá un teléfono de contacto.').max(30),
});

export type ShippingFormValues = z.infer<typeof shippingFormSchema>;

export const paymentFormSchema = z.object({
  cardholderName: z.string().min(1, 'Ingresá el nombre del titular.').max(80),
  outcome: simulatedPaymentOutcomeSchema,
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

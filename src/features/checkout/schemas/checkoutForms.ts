import { z } from 'zod';
import { simulatedPaymentOutcomeSchema } from '@shared/schemas/checkout';

export const shippingFormSchema = z.object({
  fullName: z.string().min(1, 'Ingresa el nombre de quien recibe.').max(80),
  address: z.string().min(1, 'Ingresa la dirección.').max(160),
  city: z.string().min(1, 'Ingresa la ciudad.').max(80),
  postalCode: z.string().min(1, 'Ingresa el código postal.').max(20),
  phone: z.string().min(1, 'Ingresa un teléfono de contacto.').max(30),
});

export type ShippingFormValues = z.infer<typeof shippingFormSchema>;

export const paymentFormSchema = z.object({
  cardholderName: z.string().min(1, 'Ingresa el nombre del titular.').max(80),
  outcome: simulatedPaymentOutcomeSchema,
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

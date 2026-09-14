import { z } from 'zod';

export const shippingDetailsSchema = z.object({
  fullName: z.string().min(1).max(80),
  address: z.string().min(1).max(160),
  city: z.string().min(1).max(80),
  postalCode: z.string().min(1).max(20),
  phone: z.string().min(1).max(30),
});

export type ShippingDetails = z.infer<typeof shippingDetailsSchema>;

export const PAYMENT_METHODS = ['card'] as const;

export const paymentMethodSchema = z.enum(PAYMENT_METHODS);

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const SIMULATED_PAYMENT_OUTCOMES = ['success', 'error'] as const;

export const simulatedPaymentOutcomeSchema = z.enum(SIMULATED_PAYMENT_OUTCOMES);

export type SimulatedPaymentOutcome = z.infer<typeof simulatedPaymentOutcomeSchema>;

export const paymentDraftSchema = z.object({
  cardholderName: z.string().min(1).max(80),
  method: paymentMethodSchema,
  outcome: simulatedPaymentOutcomeSchema,
});

export type PaymentDraft = z.infer<typeof paymentDraftSchema>;

export const CHECKOUT_STEPS = ['shipping', 'payment', 'review'] as const;

export const checkoutStepSchema = z.enum(CHECKOUT_STEPS);

export type CheckoutStep = z.infer<typeof checkoutStepSchema>;

export const checkoutDraftSchema = z
  .object({
    shipping: shippingDetailsSchema.nullable(),
    payment: paymentDraftSchema.nullable(),
    activeStep: checkoutStepSchema,
    orderRequestId: z.uuid(),
  })
  .refine((draft) => draft.activeStep === 'shipping' || draft.shipping !== null, {
    message: 'El paso de pago o revisión no pueden alcanzarse sin haber completado el envío.',
  })
  .refine((draft) => draft.activeStep !== 'review' || draft.payment !== null, {
    message: 'No se puede llegar a la revisión sin haber completado el pago.',
  });

export type CheckoutDraft = z.infer<typeof checkoutDraftSchema>;

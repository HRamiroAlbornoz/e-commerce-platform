import { useState } from 'react';
import type { User } from 'firebase/auth';
import { Button } from '@/components/ui/Button';
import { InlineError } from '@/components/ui/InlineError';
import { formatPrice } from '@/features/products/utils/formatPrice';
import { createOrder } from '@/features/checkout/services/createOrder';
import { roundToCents, SHIPPING_COST } from '@shared/schemas/order';
import type { SubmitState } from '@/lib/asyncSubmitState';
import type { CartLine } from '@/features/cart/hooks/useResolvedCart';
import type { PaymentDraft, ShippingDetails } from '@shared/schemas/checkout';

const REJECTED_PAYMENT_MESSAGE =
  'El pago simulado fue rechazado. Volvé al paso de pago para intentar de nuevo.';

type ReviewSectionProps = {
  shipping: ShippingDetails;
  payment: PaymentDraft;
  cartLines: CartLine[];
  subtotal: number;
  orderRequestId: string;
  user: User;
  onOrderCreated: (orderId: string) => void;
};

export function ReviewSection({
  shipping,
  payment,
  cartLines,
  subtotal,
  orderRequestId,
  user,
  onOrderCreated,
}: ReviewSectionProps) {
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });
  const total = roundToCents(subtotal + SHIPPING_COST);

  async function handleConfirm(): Promise<void> {
    if (payment.outcome === 'error') {
      setSubmitState({ status: 'error', message: REJECTED_PAYMENT_MESSAGE });
      return;
    }

    setSubmitState({ status: 'submitting' });

    const result = await createOrder(user, {
      orderRequestId,
      shipping,
      payment,
      expectedItems: cartLines.map((line) => ({
        productId: line.product.id,
        quantity: line.quantity,
        unitPrice: line.product.price,
      })),
    });

    if (result.ok) {
      onOrderCreated(result.orderId);
      return;
    }

    setSubmitState({ status: 'error', message: result.message });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-xl text-ink dark:text-bone">Revisión final</p>
      <p className="font-body text-sm text-ink/80 dark:text-bone/80">
        Revisá el envío y el pago arriba. Envío: {formatPrice(SHIPPING_COST)}. Total a confirmar:{' '}
        {formatPrice(total)}.
      </p>
      <div aria-live="polite">
        <InlineError message={submitState.status === 'error' ? submitState.message : null} />
      </div>
      <Button
        onClick={() => void handleConfirm()}
        isLoading={submitState.status === 'submitting'}
        loadingLabel="Confirmando…"
      >
        Confirmar compra
      </Button>
    </div>
  );
}

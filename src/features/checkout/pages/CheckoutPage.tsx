import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useResolvedCart } from '@/features/cart/hooks/useResolvedCart';
import { CartLinesSummary } from '@/features/cart/components/CartLinesSummary';
import { useCheckoutDraft } from '@/features/checkout/hooks/useCheckoutDraft';
import { getStepVisibility } from '@/features/checkout/state/checkoutDraftReducer';
import { CheckoutStepIndicator } from '@/features/checkout/components/CheckoutStepIndicator';
import { ShippingForm } from '@/features/checkout/components/ShippingForm';
import { ShippingSummary } from '@/features/checkout/components/ShippingSummary';
import { PaymentForm } from '@/features/checkout/components/PaymentForm';
import { PaymentSummary } from '@/features/checkout/components/PaymentSummary';
import { ReviewSection } from '@/features/checkout/components/ReviewSection';

export function CheckoutPage() {
  const auth = useAuth();
  const { setQuantity, removeItem, clearCart } = useCart();
  const cart = useResolvedCart();
  const navigate = useNavigate();
  const uid = auth.status === 'authenticated' ? auth.user.uid : '';
  const draft = useCheckoutDraft(uid);

  const shippingVisibility = getStepVisibility(draft, 'shipping');
  const paymentVisibility = getStepVisibility(draft, 'payment');
  const reviewVisibility = getStepVisibility(draft, 'review');

  function handleOrderCreated(orderId: string): void {
    clearCart();
    draft.resetDraft();
    void navigate(`/orders/${orderId}`);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 pb-24 md:px-8 md:py-16 md:pb-16">
      <h2 className="font-display text-3xl text-ink dark:text-bone">Checkout</h2>

      <CartLinesSummary
        cart={cart}
        onQuantityChange={setQuantity}
        onRemove={removeItem}
        emptyStateDescription="Agrega productos al carrito antes de iniciar la compra."
        totalVariant="sticky-bottom"
      />

      {cart.status === 'success' && cart.lines.length > 0 ? (
        <div className="flex flex-col gap-8 md:flex-row md:gap-12 md:border-t md:border-ink/15 md:pt-8 dark:md:border-bone/15">
          <CheckoutStepIndicator
            draft={draft}
            onEditShipping={draft.editShipping}
            onEditPayment={draft.editPayment}
          />

          <div className="flex flex-1 flex-col divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
            <div className="pb-10 not-first:pt-10">
              {shippingVisibility === 'form' ? (
                <ShippingForm defaultValues={draft.shipping} onSubmit={draft.submitShipping} />
              ) : draft.shipping ? (
                <ShippingSummary shipping={draft.shipping} onEdit={draft.editShipping} />
              ) : null}
            </div>

            {paymentVisibility !== 'hidden' ? (
              <div className="pb-10 not-first:pt-10">
                {paymentVisibility === 'form' ? (
                  <PaymentForm defaultValues={draft.payment} onSubmit={draft.submitPayment} />
                ) : draft.payment ? (
                  <PaymentSummary payment={draft.payment} onEdit={draft.editPayment} />
                ) : null}
              </div>
            ) : null}

            {reviewVisibility !== 'hidden' &&
            draft.shipping &&
            draft.payment &&
            auth.status === 'authenticated' ? (
              <div className="not-first:pt-10">
                <ReviewSection
                  shipping={draft.shipping}
                  payment={draft.payment}
                  cartLines={cart.lines}
                  subtotal={cart.total}
                  orderRequestId={draft.orderRequestId}
                  user={auth.user}
                  onOrderCreated={handleOrderCreated}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}

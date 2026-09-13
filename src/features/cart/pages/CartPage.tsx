import { Link } from 'react-router';
import { useCart } from '@/hooks/useCart';
import { useResolvedCart } from '@/features/cart/hooks/useResolvedCart';
import { CartLineItem } from '@/features/cart/components/CartLineItem';
import { CartSkeleton } from '@/features/cart/components/CartSkeleton';
import { MergeExclusionsNotice } from '@/features/cart/components/MergeExclusionsNotice';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { formatPrice } from '@/features/products/utils/formatPrice';

export function CartPage() {
  const { setQuantity, removeItem, mergeExclusions, dismissMergeExclusions } = useCart();
  const cart = useResolvedCart();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 md:px-8 md:py-16">
      <h2 className="font-display text-3xl text-ink dark:text-bone">Carrito</h2>

      <div className="border-t border-ink/15 pt-8 dark:border-bone/15">
        <MergeExclusionsNotice exclusions={mergeExclusions} onDismiss={dismissMergeExclusions} />

        {cart.status === 'loading' ? <CartSkeleton /> : null}

        {cart.status === 'error' ? <ErrorState message={cart.message} onRetry={cart.retry} /> : null}

        {cart.status === 'success' && cart.lines.length === 0 ? (
          <>
            <EmptyState
              title="Tu carrito esta vacio"
              description="Todavia no agregaste ningun producto. Volve al catalogo para encontrar algo."
            />
            <div className="mt-6 flex justify-center">
              <Link
                to="/"
                className="font-body border-b-2 border-ink text-sm font-medium tracking-wide text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
              >
                Ver catalogo
              </Link>
            </div>
          </>
        ) : null}

        {cart.status === 'success' && cart.lines.length > 0 ? (
          <>
            <ul className="divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
              {cart.lines.map((line) => (
                <CartLineItem
                  key={line.product.id}
                  line={line}
                  onQuantityChange={(quantity) => setQuantity(line.product.id, quantity, line.product.stock)}
                  onRemove={() => removeItem(line.product.id)}
                />
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t border-ink/15 pt-6 dark:border-bone/15">
              <p className="font-body text-xs font-medium tracking-widest text-ink/70 uppercase dark:text-bone/70">
                Total
              </p>
              <p className="font-display text-2xl tabular-nums text-ink dark:text-bone">
                {formatPrice(cart.total)}
              </p>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

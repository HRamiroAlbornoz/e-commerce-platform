import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { CartLineItem } from '@/features/cart/components/CartLineItem';
import { CartSkeleton } from '@/features/cart/components/CartSkeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { formatPrice } from '@/features/products/utils/formatPrice';
import type { CartLine } from '@/features/cart/hooks/useResolvedCart';

type ResolvedCart =
  | { status: 'loading' }
  | { status: 'error'; message: string; retry: () => void }
  | { status: 'success'; lines: CartLine[]; total: number };

type CartLinesSummaryProps = {
  cart: ResolvedCart;
  onQuantityChange: (productId: string, quantity: number, stock: number) => void;
  onRemove: (productId: string) => void;
  emptyStateDescription: string;
  totalVariant?: 'static' | 'sticky-bottom';
  children?: ReactNode;
  nonEmptyFooter?: ReactNode;
};

const STATIC_TOTAL_CLASSES =
  'mt-6 flex items-center justify-between border-t border-ink/15 pt-6 dark:border-bone/15';

const STICKY_TOTAL_CLASSES =
  'fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-ink/15 bg-bone px-4 py-4 dark:border-bone/15 dark:bg-ink md:static md:mt-6 md:border-t md:bg-transparent md:px-0 md:py-6';

export function CartLinesSummary({
  cart,
  onQuantityChange,
  onRemove,
  emptyStateDescription,
  totalVariant = 'static',
  children,
  nonEmptyFooter,
}: CartLinesSummaryProps) {
  return (
    <div className="border-t border-ink/15 pt-8 dark:border-bone/15">
      {children}

      {cart.status === 'loading' ? <CartSkeleton /> : null}

      {cart.status === 'error' ? <ErrorState message={cart.message} onRetry={cart.retry} /> : null}

      {cart.status === 'success' && cart.lines.length === 0 ? (
        <>
          <EmptyState title="Tu carrito esta vacio" description={emptyStateDescription} />
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
                onQuantityChange={(quantity) =>
                  onQuantityChange(line.product.id, quantity, line.product.stock)
                }
                onRemove={() => onRemove(line.product.id)}
              />
            ))}
          </ul>

          <div className={totalVariant === 'sticky-bottom' ? STICKY_TOTAL_CLASSES : STATIC_TOTAL_CLASSES}>
            <p className="font-body text-xs font-medium tracking-widest text-ink/70 uppercase dark:text-bone/70">
              Total
            </p>
            <p className="font-display text-2xl tabular-nums text-ink dark:text-bone">
              {formatPrice(cart.total)}
            </p>
          </div>

          {nonEmptyFooter}
        </>
      ) : null}
    </div>
  );
}

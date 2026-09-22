import { Link } from 'react-router';
import { useCart } from '@/hooks/useCart';
import { useResolvedCart } from '@/features/cart/hooks/useResolvedCart';
import { CartLinesSummary } from '@/features/cart/components/CartLinesSummary';
import { MergeExclusionsNotice } from '@/features/cart/components/MergeExclusionsNotice';
import { BUTTON_CLASSES } from '@/components/ui/Button';

export function CartPage() {
  const { setQuantity, removeItem, mergeExclusions, dismissMergeExclusions } = useCart();
  const cart = useResolvedCart();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 md:px-8 md:py-16">
      <h2 className="font-display text-3xl text-ink dark:text-bone">Carrito</h2>

      <CartLinesSummary
        cart={cart}
        onQuantityChange={setQuantity}
        onRemove={removeItem}
        emptyStateDescription="Todavía no agregaste ningún producto. Vuelve al catálogo para encontrar algo."
        nonEmptyFooter={
          <div className="mt-6 flex justify-end">
            <Link to="/checkout" className={BUTTON_CLASSES}>
              Ir a pagar
            </Link>
          </div>
        }
      >
        <MergeExclusionsNotice exclusions={mergeExclusions} onDismiss={dismissMergeExclusions} />
      </CartLinesSummary>
    </main>
  );
}

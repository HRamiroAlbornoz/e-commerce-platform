import { Link } from 'react-router';
import { QuantitySelector } from '@/components/ui/QuantitySelector';
import { FIELD_COLOR_CLASSES } from '@/features/products/constants/displayColors';
import { formatPrice } from '@/features/products/utils/formatPrice';
import type { CartLine } from '@/features/cart/hooks/useResolvedCart';

type CartLineItemProps = {
  line: CartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLineItem({ line, onQuantityChange, onRemove }: CartLineItemProps) {
  const { product, quantity, lineTotal } = line;
  const nameId = `cart-line-name-${product.id}`;

  return (
    <li className="flex gap-4 py-6">
      <span aria-hidden="true" className={`w-1 shrink-0 ${FIELD_COLOR_CLASSES[product.displayColor]}`} />

      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <Link
            id={nameId}
            to={`/products/${product.id}`}
            className="font-display text-lg text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone dark:focus-visible:outline-field-cyan"
          >
            {product.name}
          </Link>
          <p className="font-body text-xs text-ink/70 dark:text-bone/70">
            {formatPrice(product.price)} c/u
          </p>
        </div>

        <div className="flex items-center justify-between gap-6 md:justify-end">
          <QuantitySelector
            maxQuantity={product.stock}
            initialQuantity={Math.min(quantity, product.stock)}
            onQuantityChange={onQuantityChange}
          />

          <p className="font-display w-20 text-right text-base tabular-nums text-ink dark:text-bone">
            {formatPrice(lineTotal)}
          </p>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`Quitar ${product.name} del carrito`}
            className="font-body border-b border-transparent text-xs font-medium tracking-wide text-ink/70 uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:text-bone/70 dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
          >
            Quitar
          </button>
        </div>
      </div>
    </li>
  );
}

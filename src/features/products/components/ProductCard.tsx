import { Link } from 'react-router';
import type { Product } from '@shared/schemas/product';
import { useCart } from '@/hooks/useCart';
import { FIELD_COLOR_CLASSES } from '@/features/products/constants/displayColors';
import { formatPrice } from '@/features/products/utils/formatPrice';

type ProductCardProps = {
  product: Product;
  pieceNumber: number;
};

export function ProductCard({ product, pieceNumber }: ProductCardProps) {
  const { addItem } = useCart();
  const nameId = `product-card-name-${product.id}`;
  const descriptionId = `product-card-description-${product.id}`;
  const priceId = `product-card-price-${product.id}`;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="flex h-full flex-col">
      <Link to={`/products/${product.id}`} aria-labelledby={`${nameId} ${descriptionId} ${priceId}`}>
        <div
          className={`relative aspect-square overflow-hidden ${FIELD_COLOR_CLASSES[product.displayColor]}`}
        >
          <span className="font-body absolute top-3 left-3 text-xs font-medium tracking-widest text-ink/70 uppercase">
            No. {String(pieceNumber).padStart(2, '0')}
          </span>
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-contain p-8"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-1 pt-4">
          <h2 id={nameId} className="font-display text-lg leading-tight text-ink dark:text-bone">
            {product.name}
          </h2>
          <p id={descriptionId} className="font-body line-clamp-1 text-sm text-ink/70 dark:text-bone/70">
            {product.description}
          </p>
        </div>
      </Link>

      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
        <p id={priceId} className="font-display text-base text-ink dark:text-bone">
          {formatPrice(product.price)}
        </p>
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() => addItem(product.id, 1, product.stock)}
          className="font-body border-b border-transparent text-xs font-medium tracking-widest text-ink uppercase enabled:hover:border-field-magenta enabled:hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta disabled:cursor-not-allowed disabled:opacity-40 dark:text-bone dark:enabled:hover:border-field-cyan dark:enabled:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
        >
          {isOutOfStock ? 'Sin stock' : 'Agregar'}
        </button>
      </div>
    </div>
  );
}

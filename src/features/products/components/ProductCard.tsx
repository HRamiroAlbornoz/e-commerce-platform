import { Link } from 'react-router';
import type { Product } from '@shared/schemas/product';
import { FIELD_COLOR_CLASSES } from '@/features/products/constants/displayColors';
import { formatPrice } from '@/features/products/utils/formatPrice';

type ProductCardProps = {
  product: Product;
  pieceNumber: number;
};

export function ProductCard({ product, pieceNumber }: ProductCardProps) {
  const nameId = `product-card-name-${product.id}`;
  const descriptionId = `product-card-description-${product.id}`;
  const priceId = `product-card-price-${product.id}`;

  return (
    <Link
      to={`/products/${product.id}`}
      aria-labelledby={`${nameId} ${descriptionId} ${priceId}`}
      className="flex h-full flex-col"
    >
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
      <div className="flex flex-1 flex-col gap-1 pt-4">
        <h2 id={nameId} className="font-display text-lg leading-tight text-ink dark:text-bone">
          {product.name}
        </h2>
        <p id={descriptionId} className="font-body line-clamp-1 text-sm text-ink/70 dark:text-bone/70">
          {product.description}
        </p>
        <p id={priceId} className="font-display mt-auto pt-2 text-base text-ink dark:text-bone">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}

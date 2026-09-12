import type { Product } from '@shared/schemas/product';
import { FIELD_COLOR_CLASSES } from '@/features/products/constants/displayColors';

const priceFormatter = new Intl.NumberFormat('es-AR');

type ProductCardProps = {
  product: Product;
  pieceNumber: number;
};

export function ProductCard({ product, pieceNumber }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col">
      <div
        className={`relative aspect-square overflow-hidden ${FIELD_COLOR_CLASSES[product.displayColor]}`}
      >
        <span className="font-body absolute top-3 left-3 text-xs font-medium tracking-widest text-ink/70 uppercase">
          No. {String(pieceNumber).padStart(2, '0')}
        </span>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-contain p-8"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 pt-4">
        <h2 className="font-display text-lg leading-tight text-ink dark:text-bone">
          {product.name}
        </h2>
        <p className="font-body line-clamp-1 text-sm text-ink/70 dark:text-bone/70">
          {product.description}
        </p>
        <p className="font-display mt-auto pt-2 text-base text-ink dark:text-bone">
          ${priceFormatter.format(product.price)}
        </p>
      </div>
    </article>
  );
}

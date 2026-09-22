import { Link } from 'react-router';
import type { Product } from '@shared/schemas/product';
import { AddToCartControl } from '@/features/products/components/AddToCartControl';
import { FIELD_COLOR_CLASSES } from '@/features/products/constants/displayColors';
import { formatPrice } from '@/features/products/utils/formatPrice';

type FeaturedProductHeroProps = {
  product: Product;
};

export const FEATURED_PRODUCT_HERO_LAYOUT_CLASSES =
  'mb-10 grid grid-cols-1 border-b border-ink/15 md:grid-cols-2 dark:border-bone/15';

export function FeaturedProductHero({ product }: FeaturedProductHeroProps) {
  const nameId = `featured-product-name-${product.id}`;

  return (
    <section aria-labelledby={nameId} className={FEATURED_PRODUCT_HERO_LAYOUT_CLASSES}>
      <Link
        to={`/products/${product.id}`}
        className={`flex h-64 items-center justify-center p-12 md:h-auto md:min-h-144 ${FIELD_COLOR_CLASSES[product.displayColor]}`}
      >
        <img
          src={product.imageUrl}
          alt=""
          className="max-h-full w-full object-contain"
          loading="eager"
          fetchPriority="high"
        />
      </Link>

      <div className="flex flex-col gap-4 bg-bone px-6 py-10 text-ink md:px-12">
        <h2 id={nameId} className="font-display text-3xl text-balance leading-tight">
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h2>

        <p className="font-body text-sm text-ink/70 italic">{product.curatorialNote}</p>

        <div className="mt-auto flex flex-col gap-4 pt-4 md:flex-row md:items-end md:justify-between md:pt-6">
          <p className="font-display text-2xl">{formatPrice(product.price)}</p>
          <AddToCartControl product={product} />
        </div>

        <a
          href="#catalogo"
          className="font-body text-sm text-ink/70 underline decoration-1 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:focus-visible:outline-field-cyan"
        >
          Ver el resto de la sala
        </a>
      </div>
    </section>
  );
}

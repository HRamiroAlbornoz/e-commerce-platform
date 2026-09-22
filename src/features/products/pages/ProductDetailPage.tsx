import { Link, useParams } from 'react-router';
import { useProduct } from '@/features/products/hooks/useProduct';
import { AddToCartControl } from '@/features/products/components/AddToCartControl';
import { ProductDetailSkeleton } from '@/features/products/components/ProductDetailSkeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { FIELD_COLOR_CLASSES } from '@/features/products/constants/displayColors';
import { PRODUCT_IMAGE_FRAME_HEIGHT_CLASSES } from '@/features/products/constants/productImageFrame';
import { formatPrice } from '@/features/products/utils/formatPrice';
import type { Product } from '@shared/schemas/product';

function ProductDetailContent({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2">
      <div
        className={`flex items-center justify-center p-12 ${PRODUCT_IMAGE_FRAME_HEIGHT_CLASSES} ${FIELD_COLOR_CLASSES[product.displayColor]}`}
      >
        <img
          src={product.imageUrl}
          alt=""
          width={600}
          height={400}
          className="max-h-full w-full object-contain"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col gap-4 border-b border-ink/15 bg-bone px-6 py-10 text-ink md:border-r md:px-12 dark:border-bone/15">
        <h1 className="font-display text-3xl text-balance leading-tight">{product.name}</h1>
        <p className="font-body text-sm text-ink/70">{product.description}</p>

        {product.ratingCount > 0 ? (
          <Link
            to={`/products/${product.id}/reviews`}
            className="font-body text-sm underline decoration-1 underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:focus-visible:outline-field-cyan"
          >
            {product.ratingAverage.toFixed(1)} · {product.ratingCount} reseñas
          </Link>
        ) : (
          <p className="font-body text-sm text-ink/70">Todavía sin reseñas</p>
        )}

        <p className="font-body text-sm text-ink/70 italic">{product.curatorialNote}</p>

        <dl className="mt-2 flex flex-col divide-y divide-dotted divide-ink/30 font-body text-sm">
          {product.specs.map((spec) => (
            <div key={spec.label} className="flex justify-between gap-4 py-2">
              <dt className="text-ink/70">{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex flex-col gap-4 pt-6 md:flex-row md:items-end md:justify-between">
          <p className="font-display text-2xl">{formatPrice(product.price)}</p>

          <AddToCartControl product={product} />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const detail = useProduct(id);
  const isPadded = detail.status === 'not-found' || detail.status === 'error';

  return (
    <main className={`mx-auto max-w-6xl ${isPadded ? 'px-4 py-10 md:px-8 lg:px-12' : ''}`}>
      {detail.status === 'loading' ? <ProductDetailSkeleton /> : null}

      {detail.status === 'not-found' ? (
        <EmptyState
          title="Producto no encontrado"
          description="Este producto no existe o ya no está disponible."
        />
      ) : null}

      {detail.status === 'error' ? (
        <ErrorState message={detail.message} onRetry={detail.retry} />
      ) : null}

      {detail.status === 'success' ? <ProductDetailContent product={detail.product} /> : null}
    </main>
  );
}

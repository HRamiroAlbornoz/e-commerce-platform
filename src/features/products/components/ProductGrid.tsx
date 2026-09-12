import { memo } from 'react';
import type { Product } from '@shared/schemas/product';
import { ProductCard } from '@/features/products/components/ProductCard';
import { ProductCardSkeleton } from '@/features/products/components/ProductCardSkeleton';

const SKELETON_COUNT = 8;

type ProductGridProps =
  | { status: 'loading' }
  | { status: 'success'; products: Product[] };

export const ProductGrid = memo(function ProductGrid(props: ProductGridProps) {
  if (props.status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
      {props.products.map((product, index) => (
        <ProductCard key={product.id} product={product} pieceNumber={index + 1} />
      ))}
    </div>
  );
});

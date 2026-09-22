import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getFeaturedProduct } from '@/features/products/services/getFeaturedProduct';
import type { Product } from '@shared/schemas/product';

type FeaturedProductState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; product: Product | null };

export function useFeaturedProduct(): FeaturedProductState & { retry: () => void } {
  const result = useKeyedAsync(
    'featured-product',
    getFeaturedProduct,
    'No pudimos cargar la pieza destacada. Intenta de nuevo.',
  );

  if (result.status === 'success') {
    return { status: 'success', product: result.data, retry: result.retry };
  }

  return result;
}

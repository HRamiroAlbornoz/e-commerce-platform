import { useCallback } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getProductById } from '@/features/products/services/getProductById';
import type { Product } from '@shared/schemas/product';

type ProductDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not-found' }
  | { status: 'success'; product: Product };

export function useProduct(id: string | undefined): ProductDetailState & { retry: () => void } {
  const fetchProduct = useCallback(() => {
    if (!id) {
      return Promise.resolve(null);
    }
    return getProductById(id);
  }, [id]);

  const result = useKeyedAsync(
    id ?? '',
    fetchProduct,
    'No pudimos cargar el producto. Intenta de nuevo.',
  );

  if (!id) {
    return { status: 'not-found', retry: result.retry };
  }

  if (result.status === 'success') {
    return result.data
      ? { status: 'success', product: result.data, retry: result.retry }
      : { status: 'not-found', retry: result.retry };
  }

  return result;
}

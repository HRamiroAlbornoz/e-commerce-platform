import { useCallback } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getAdminProductById } from '@/features/admin/products/services/getAdminProductById';
import type { Product } from '@shared/schemas/product';

type AdminProductDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not-found' }
  | { status: 'success'; product: Product };

export function useAdminProduct(id: string | undefined): AdminProductDetailState & { retry: () => void } {
  const fetchProduct = useCallback(() => {
    if (!id) {
      return Promise.resolve(null);
    }
    return getAdminProductById(id);
  }, [id]);

  const result = useKeyedAsync(
    id ?? '',
    fetchProduct,
    'No pudimos cargar el producto. Intentá de nuevo.',
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

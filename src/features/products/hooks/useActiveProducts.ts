import { useCallback } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import {
  getActiveProducts,
  type ProductFilters,
} from '@/features/products/services/getActiveProducts';
import type { Product } from '@shared/schemas/product';

type ProductsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] };

export function useActiveProducts(filters: ProductFilters = {}): ProductsState & {
  retry: () => void;
} {
  const { category, searchTerm } = filters;
  const filterKey = `${category ?? ''}::${searchTerm ?? ''}`;
  const fetchProducts = useCallback(
    () => getActiveProducts({ category, searchTerm }),
    [category, searchTerm],
  );

  const result = useKeyedAsync(
    filterKey,
    fetchProducts,
    'No pudimos cargar el catalogo. Intenta de nuevo.',
  );

  if (result.status === 'success') {
    return { status: 'success', products: result.data, retry: result.retry };
  }

  return result;
}

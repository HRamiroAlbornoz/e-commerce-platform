import { useCallback, useRef } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import {
  getActiveProducts,
  type ProductFilters,
  type ProductsPage,
} from '@/features/products/services/getActiveProducts';
import type { Product } from '@shared/schemas/product';

type ProductsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[]; hasNextPage: boolean };

type PageCache = {
  filterKey: string;
  pages: Map<number, ProductsPage>;
};

function toFilterKey(filters: ProductFilters): string {
  return `${filters.category ?? ''}::${filters.searchTerm ?? ''}`;
}

async function loadPage(
  targetPage: number,
  filters: ProductFilters,
  cache: PageCache,
): Promise<ProductsPage> {
  let result = cache.pages.get(1) ?? (await getActiveProducts(filters));
  cache.pages.set(1, result);

  for (let page = 2; page <= targetPage && result.hasNextPage; page += 1) {
    const cached = cache.pages.get(page);
    result = cached ?? (await getActiveProducts(filters, result.lastDoc ?? undefined));
    if (!cached) {
      cache.pages.set(page, result);
    }
  }

  return result;
}

export function useActiveProducts(
  filters: ProductFilters,
  page: number,
): ProductsState & { retry: () => void } {
  const { category, searchTerm } = filters;
  const filterKey = toFilterKey(filters);
  const cacheRef = useRef<PageCache>({ filterKey, pages: new Map() });

  const fetchPage = useCallback(() => {
    if (cacheRef.current.filterKey !== filterKey) {
      cacheRef.current = { filterKey, pages: new Map() };
    }
    return loadPage(page, { category, searchTerm }, cacheRef.current);
  }, [category, searchTerm, page, filterKey]);

  const result = useKeyedAsync(
    `${filterKey}::${page}`,
    fetchPage,
    'No pudimos cargar el catalogo. Intenta de nuevo.',
  );

  if (result.status === 'success') {
    return {
      status: 'success',
      products: result.data.products,
      hasNextPage: result.data.hasNextPage,
      retry: result.retry,
    };
  }

  return result;
}

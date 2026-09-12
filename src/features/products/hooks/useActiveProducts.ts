import { useCallback, useEffect, useState } from 'react';
import {
  getActiveProducts,
  type ProductFilters,
} from '@/features/products/services/getActiveProducts';
import type { Product } from '@shared/schemas/product';

type FetchResult =
  | { key: string; status: 'success'; products: Product[] }
  | { key: string; status: 'error'; message: string };

type ProductsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] };

export function useActiveProducts(filters: ProductFilters = {}): ProductsState & {
  retry: () => void;
} {
  const { category, searchTerm } = filters;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<FetchResult | null>(null);
  const requestKey = `${category ?? ''}::${searchTerm ?? ''}::${attempt}`;

  useEffect(() => {
    let isMounted = true;

    getActiveProducts({ category, searchTerm })
      .then((products) => {
        if (isMounted) {
          setResult({ key: requestKey, status: 'success', products });
        }
      })
      .catch(() => {
        if (isMounted) {
          setResult({
            key: requestKey,
            status: 'error',
            message: 'No pudimos cargar el catalogo. Intenta de nuevo.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category, searchTerm, requestKey]);

  const retry = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  if (result === null || result.key !== requestKey) {
    return { status: 'loading', retry };
  }

  if (result.status === 'error') {
    return { status: 'error', message: result.message, retry };
  }

  return { status: 'success', products: result.products, retry };
}

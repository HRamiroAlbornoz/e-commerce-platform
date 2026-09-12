import { useCallback, useEffect, useState } from 'react';
import { getActiveProducts } from '@/features/products/services/getActiveProducts';
import type { Product } from '@shared/schemas/product';

type ProductsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] };

export function useActiveProducts(): ProductsState & { retry: () => void } {
  const [state, setState] = useState<ProductsState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    getActiveProducts()
      .then((products) => {
        if (isMounted) {
          setState({ status: 'success', products });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            status: 'error',
            message: 'No pudimos cargar el catalogo. Intenta de nuevo.',
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, retry };
}

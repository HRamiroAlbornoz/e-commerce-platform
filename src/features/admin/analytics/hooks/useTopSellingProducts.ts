import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getTopSellingProducts } from '@/features/admin/analytics/services/getTopSellingProducts';
import type { Product } from '@shared/schemas/product';

type TopSellingProductsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; products: Product[] };

export function useTopSellingProducts(): TopSellingProductsState & { retry: () => void } {
  const result = useKeyedAsync(
    'admin-analytics-top-products',
    getTopSellingProducts,
    'No pudimos cargar el ranking de productos. Intenta de nuevo.',
  );

  if (result.status === 'success') {
    return { status: 'success', products: result.data, retry: result.retry };
  }

  return result;
}

import { useCallback } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getAdminProducts } from '@/features/admin/products/services/getAdminProducts';

export function useAdminProducts() {
  const fetchProducts = useCallback(() => getAdminProducts(), []);

  return useKeyedAsync(
    'admin-products',
    fetchProducts,
    'No pudimos cargar los productos. Intenta de nuevo.',
  );
}

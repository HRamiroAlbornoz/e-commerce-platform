import { useCallback } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getAllOrders } from '@/features/admin/orders/services/getAllOrders';
import type { Order, OrderStatus } from '@shared/schemas/order';

type AdminOrdersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; orders: Order[] };

export function useAdminOrders(statusFilter: OrderStatus | undefined): AdminOrdersState & {
  retry: () => void;
} {
  const fetchOrders = useCallback(() => getAllOrders(statusFilter), [statusFilter]);

  const result = useKeyedAsync(
    statusFilter ?? 'all',
    fetchOrders,
    'No pudimos cargar las órdenes. Intenta de nuevo.',
  );

  if (result.status === 'success') {
    return { status: 'success', orders: result.data, retry: result.retry };
  }

  return result;
}

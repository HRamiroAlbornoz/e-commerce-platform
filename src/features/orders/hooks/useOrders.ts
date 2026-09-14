import { useCallback } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getOrders } from '@/features/orders/services/getOrders';
import type { Order } from '@shared/schemas/order';

type OrdersState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; orders: Order[] };

export function useOrders(uid: string): OrdersState & { retry: () => void } {
  const fetchOrders = useCallback(() => getOrders(uid), [uid]);

  const result = useKeyedAsync(
    uid,
    fetchOrders,
    'No pudimos cargar tus órdenes. Intenta de nuevo.',
  );

  if (result.status === 'success') {
    return { status: 'success', orders: result.data, retry: result.retry };
  }

  return result;
}

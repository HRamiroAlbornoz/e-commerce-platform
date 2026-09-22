import { useCallback } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getOrderById } from '@/features/orders/services/getOrderById';
import type { Order } from '@shared/schemas/order';

type OrderDetailState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'not-found' }
  | { status: 'success'; order: Order };

export function useOrder(id: string | undefined): OrderDetailState & { retry: () => void } {
  const fetchOrder = useCallback(() => {
    if (!id) {
      return Promise.resolve(null);
    }
    return getOrderById(id);
  }, [id]);

  const result = useKeyedAsync(
    id ?? '',
    fetchOrder,
    'No pudimos cargar la orden. Intenta de nuevo.',
  );

  if (!id) {
    return { status: 'not-found', retry: result.retry };
  }

  if (result.status === 'success') {
    return result.data
      ? { status: 'success', order: result.data, retry: result.retry }
      : { status: 'not-found', retry: result.retry };
  }

  return result;
}

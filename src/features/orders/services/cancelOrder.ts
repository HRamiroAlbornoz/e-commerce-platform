import type { User } from 'firebase/auth';
import { postOrderRequest } from '@/lib/orderApiRequest';
import { cancelOrderResponseSchema } from '@shared/schemas/order';

const GENERIC_CANCEL_ERROR = 'No pudimos cancelar la orden. Intentá de nuevo.';

export type CancelOrderResult = { ok: true } | { ok: false; message: string };

export async function cancelOrder(user: User, orderId: string): Promise<CancelOrderResult> {
  const result = await postOrderRequest(
    user,
    '/api/orders/cancel',
    { orderId },
    cancelOrderResponseSchema,
    GENERIC_CANCEL_ERROR,
  );

  return result.ok ? { ok: true } : result;
}

import type { User } from 'firebase/auth';
import { postJsonRequest } from '@/lib/apiRequest';
import { cancelOrderResponseSchema, orderErrorResponseSchema } from '@shared/schemas/order';

const GENERIC_CANCEL_ERROR = 'No pudimos cancelar la orden. Intenta de nuevo.';

export type CancelOrderResult = { ok: true } | { ok: false; message: string };

export async function cancelOrder(user: User, orderId: string): Promise<CancelOrderResult> {
  const result = await postJsonRequest(
    user,
    '/api/orders/cancel',
    { orderId },
    cancelOrderResponseSchema,
    orderErrorResponseSchema,
    GENERIC_CANCEL_ERROR,
  );

  return result.ok ? { ok: true } : result;
}

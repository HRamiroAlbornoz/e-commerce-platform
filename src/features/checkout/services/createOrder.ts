import type { User } from 'firebase/auth';
import { postOrderRequest } from '@/lib/orderApiRequest';
import { createOrderResponseSchema, type CreateOrderRequest } from '@shared/schemas/order';

const GENERIC_ORDER_ERROR = 'No pudimos procesar tu compra. Intentá de nuevo.';

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; message: string };

export async function createOrder(
  user: User,
  request: CreateOrderRequest,
): Promise<CreateOrderResult> {
  const result = await postOrderRequest(
    user,
    '/api/orders/create',
    request,
    createOrderResponseSchema,
    GENERIC_ORDER_ERROR,
  );

  return result.ok ? { ok: true, orderId: result.data.orderId } : result;
}

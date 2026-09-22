import type { User } from 'firebase/auth';
import { postJsonRequest } from '@/lib/apiRequest';
import {
  createOrderResponseSchema,
  orderErrorResponseSchema,
  type CreateOrderRequest,
} from '@shared/schemas/order';

const GENERIC_ORDER_ERROR = 'No pudimos procesar tu compra. Intenta de nuevo.';

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; message: string };

export async function createOrder(
  user: User,
  request: CreateOrderRequest,
): Promise<CreateOrderResult> {
  const result = await postJsonRequest(
    user,
    '/api/orders/create',
    request,
    createOrderResponseSchema,
    orderErrorResponseSchema,
    GENERIC_ORDER_ERROR,
  );

  return result.ok ? { ok: true, orderId: result.data.orderId } : result;
}

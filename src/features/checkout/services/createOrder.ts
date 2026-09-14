import { getIdToken, type User } from 'firebase/auth';
import {
  createOrderResponseSchema,
  orderErrorResponseSchema,
  type CreateOrderRequest,
} from '@shared/schemas/order';

const GENERIC_ORDER_ERROR = 'No pudimos procesar tu compra. Intentá de nuevo.';

export type CreateOrderResult = { ok: true; orderId: string } | { ok: false; message: string };

export async function createOrder(
  user: User,
  request: CreateOrderRequest,
): Promise<CreateOrderResult> {
  try {
    const token = await getIdToken(user);
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(request),
    });

    const body: unknown = await response.json();

    if (response.ok) {
      const parsed = createOrderResponseSchema.safeParse(body);
      return parsed.success
        ? { ok: true, orderId: parsed.data.orderId }
        : { ok: false, message: GENERIC_ORDER_ERROR };
    }

    const parsedError = orderErrorResponseSchema.safeParse(body);
    return {
      ok: false,
      message: parsedError.success ? parsedError.data.message : GENERIC_ORDER_ERROR,
    };
  } catch {
    return { ok: false, message: GENERIC_ORDER_ERROR };
  }
}

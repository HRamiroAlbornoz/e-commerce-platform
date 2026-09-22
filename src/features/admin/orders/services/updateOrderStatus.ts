import type { User } from 'firebase/auth';
import { postJsonRequest } from '@/lib/apiRequest';
import {
  orderErrorResponseSchema,
  updateOrderStatusResponseSchema,
  type OrderStatus,
} from '@shared/schemas/order';

const GENERIC_UPDATE_ERROR = 'No pudimos cambiar el estado de la orden. Intenta de nuevo.';

export type UpdateOrderStatusResult = { ok: true } | { ok: false; message: string };

export async function updateOrderStatus(
  user: User,
  orderId: string,
  status: OrderStatus,
): Promise<UpdateOrderStatusResult> {
  const result = await postJsonRequest(
    user,
    '/api/admin/orders/update-status',
    { orderId, status },
    updateOrderStatusResponseSchema,
    orderErrorResponseSchema,
    GENERIC_UPDATE_ERROR,
  );

  return result.ok ? { ok: true } : result;
}

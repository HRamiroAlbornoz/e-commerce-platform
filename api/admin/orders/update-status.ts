import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../../_lib/firebaseAdmin.js';
import { requireAdmin } from '../../_lib/requireAdmin.js';
import { OrderError, respondWithError } from '../../_lib/orderErrors.js';
import { cancelOrderAndRestoreStock } from '../../_lib/orderCancellation.js';
import {
  isValidOrderStatusTransition,
  orderSchema,
  updateOrderStatusRequestSchema,
  type UpdateOrderStatusResponse,
} from '../../../shared/schemas/order.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = randomUUID();

  const auth = await requireAdmin(
    req,
    res,
    requestId,
    (code, message) => new OrderError(code, message),
    respondWithError,
  );
  if (!auth) {
    return;
  }

  const parsedBody = updateOrderStatusRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    respondWithError(
      res,
      requestId,
      new OrderError(
        'INVALID_REQUEST',
        'La solicitud de cambio de estado no tiene un formato válido.',
      ),
    );
    return;
  }

  const { orderId, status: nextStatus } = parsedBody.data;

  try {
    await adminDb.runTransaction(async (tx) => {
      const orderRef = adminDb.doc(`orders/${orderId}`);
      const orderSnap = await tx.get(orderRef);

      if (!orderSnap.exists) {
        throw new OrderError('ORDER_NOT_FOUND', 'No encontramos esa orden.');
      }

      const rawOrder: Record<string, unknown> = orderSnap.data() ?? {};
      const createdAt =
        rawOrder.createdAt instanceof Timestamp ? rawOrder.createdAt.toDate() : rawOrder.createdAt;
      const updatedAt =
        rawOrder.updatedAt instanceof Timestamp ? rawOrder.updatedAt.toDate() : rawOrder.updatedAt;
      const order = orderSchema.parse({ ...rawOrder, id: orderSnap.id, createdAt, updatedAt });

      if (!isValidOrderStatusTransition(order.status, nextStatus)) {
        throw new OrderError(
          'INVALID_STATUS_TRANSITION',
          `Esta orden no puede pasar de "${order.status}" a "${nextStatus}".`,
        );
      }

      if (nextStatus === 'cancelled') {
        await cancelOrderAndRestoreStock(tx, order, orderRef);
        return;
      }

      tx.update(orderRef, { status: nextStatus, updatedAt: FieldValue.serverTimestamp() });
    });

    const response: UpdateOrderStatusResponse = { orderId, status: nextStatus };
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof OrderError) {
      respondWithError(res, requestId, err);
      return;
    }

    respondWithError(
      res,
      requestId,
      new OrderError(
        'INTERNAL_ERROR',
        'No pudimos cambiar el estado de la orden. Intenta de nuevo.',
      ),
    );
  }
}

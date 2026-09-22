import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../_lib/firebaseAdmin.js';
import { verifyRequestToken } from '../_lib/verifyRequestToken.js';
import { OrderError, respondWithError } from '../_lib/orderErrors.js';
import { cancelOrderAndRestoreStock } from '../_lib/orderCancellation.js';
import {
  cancelOrderRequestSchema,
  orderSchema,
  type CancelOrderResponse,
} from '../../shared/schemas/order.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = randomUUID();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    respondWithError(res, requestId, new OrderError('INVALID_REQUEST', 'Método no permitido.'));
    return;
  }

  const auth = await verifyRequestToken(req);
  if (!auth.ok) {
    respondWithError(
      res,
      requestId,
      new OrderError('UNAUTHENTICATED', 'Sesión inválida o expirada. Inicia sesión de nuevo.'),
    );
    return;
  }

  const parsedBody = cancelOrderRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    respondWithError(
      res,
      requestId,
      new OrderError('INVALID_REQUEST', 'La solicitud de cancelación no tiene un formato válido.'),
    );
    return;
  }

  const { orderId } = parsedBody.data;

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

      if (order.userId !== auth.uid) {
        throw new OrderError('ORDER_NOT_FOUND', 'No encontramos esa orden.');
      }

      if (order.status !== 'pending') {
        throw new OrderError('INVALID_STATUS_TRANSITION', 'Esta orden ya no se puede cancelar.');
      }

      await cancelOrderAndRestoreStock(tx, order, orderRef);
    });

    const response: CancelOrderResponse = { orderId, status: 'cancelled' };
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof OrderError) {
      respondWithError(res, requestId, err);
      return;
    }

    respondWithError(
      res,
      requestId,
      new OrderError('INTERNAL_ERROR', 'No pudimos cancelar la orden. Intenta de nuevo.'),
    );
  }
}

import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AggregateField, FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../_lib/firebaseAdmin.js';
import { verifyRequestToken } from '../_lib/verifyRequestToken.js';
import { ReviewError, respondWithError } from '../_lib/reviewErrors.js';
import {
  recalculateRatingRequestSchema,
  type RecalculateRatingResponse,
} from '../../shared/schemas/review.js';

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = randomUUID();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    respondWithError(res, requestId, new ReviewError('INVALID_REQUEST', 'Método no permitido.'));
    return;
  }

  const auth = await verifyRequestToken(req);
  if (!auth.ok) {
    respondWithError(
      res,
      requestId,
      new ReviewError('UNAUTHENTICATED', 'Sesión inválida o expirada. Inicia sesión de nuevo.'),
    );
    return;
  }

  const parsedBody = recalculateRatingRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    respondWithError(
      res,
      requestId,
      new ReviewError('INVALID_REQUEST', 'La solicitud de recálculo no tiene un formato válido.'),
    );
    return;
  }

  const { productId } = parsedBody.data;

  try {
    const productRef = adminDb.doc(`products/${productId}`);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new ReviewError('PRODUCT_NOT_FOUND', 'No encontramos ese producto.');
    }

    const aggregateSnap = await adminDb
      .collection(`products/${productId}/reviews`)
      .aggregate({ count: AggregateField.count(), average: AggregateField.average('rating') })
      .get();

    const { count, average } = aggregateSnap.data();
    const ratingCount = count;
    const ratingAverage = roundToOneDecimal(average ?? 0);

    await productRef.update({
      ratingAverage,
      ratingCount,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const response: RecalculateRatingResponse = { productId, ratingAverage, ratingCount };
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof ReviewError) {
      respondWithError(res, requestId, err);
      return;
    }
    respondWithError(
      res,
      requestId,
      new ReviewError('INTERNAL_ERROR', 'No pudimos actualizar el promedio del producto.'),
    );
  }
}

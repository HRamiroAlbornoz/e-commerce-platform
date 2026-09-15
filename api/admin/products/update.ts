import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue, GrpcStatus } from 'firebase-admin/firestore';
import { adminDb } from '../../_lib/firebaseAdmin.js';
import { requireAdmin } from '../../_lib/requireAdmin.js';
import { ProductError, respondWithError } from '../../_lib/productErrors.js';
import { roundToCents } from '../../../shared/schemas/order.js';
import {
  toNameLower,
  updateProductRequestSchema,
  type UpdateProductResponse,
} from '../../../shared/schemas/product.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = randomUUID();

  const auth = await requireAdmin(req, res, requestId);
  if (!auth) {
    return;
  }

  const parsedBody = updateProductRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    respondWithError(
      res,
      requestId,
      new ProductError('INVALID_REQUEST', 'La solicitud de edición no tiene un formato válido.'),
    );
    return;
  }

  const { productId, changes } = parsedBody.data;

  try {
    const updateData: Record<string, unknown> = { ...changes, updatedAt: FieldValue.serverTimestamp() };
    if (changes.price !== undefined) {
      updateData.price = roundToCents(changes.price);
    }
    if (changes.name !== undefined) {
      updateData.nameLower = toNameLower(changes.name);
    }

    await adminDb.doc(`products/${productId}`).update(updateData);

    const response: UpdateProductResponse = { productId };
    res.status(200).json(response);
  } catch (err) {
    if (isFirestoreNotFoundError(err)) {
      respondWithError(
        res,
        requestId,
        new ProductError('PRODUCT_NOT_FOUND', 'No encontramos ese producto.'),
      );
      return;
    }

    respondWithError(
      res,
      requestId,
      new ProductError('INTERNAL_ERROR', 'No pudimos actualizar el producto. Intentá de nuevo.'),
    );
  }
}

function isFirestoreNotFoundError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === GrpcStatus.NOT_FOUND;
}

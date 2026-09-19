import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../../_lib/firebaseAdmin.js';
import { requireAdmin } from '../../_lib/requireAdmin.js';
import { ProductError, respondWithError } from '../../_lib/productErrors.js';
import { roundToCents } from '../../../shared/schemas/order.js';
import {
  createProductRequestSchema,
  toNameLower,
  type CreateProductResponse,
} from '../../../shared/schemas/product.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = randomUUID();

  const auth = await requireAdmin(
    req,
    res,
    requestId,
    (code, message) => new ProductError(code, message),
    respondWithError,
  );
  if (!auth) {
    return;
  }

  const parsedBody = createProductRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    respondWithError(
      res,
      requestId,
      new ProductError('INVALID_REQUEST', 'La solicitud de creación no tiene un formato válido.'),
    );
    return;
  }

  const input = parsedBody.data;

  try {
    const productRef = adminDb.collection('products').doc(randomUUID());
    await productRef.create({
      ...input,
      price: roundToCents(input.price),
      nameLower: toNameLower(input.name),
      isActive: true,
      ratingAverage: 0,
      ratingCount: 0,
      orderCount: 0,
      unitsSold: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const response: CreateProductResponse = { productId: productRef.id };
    res.status(200).json(response);
  } catch {
    respondWithError(
      res,
      requestId,
      new ProductError('INTERNAL_ERROR', 'No pudimos crear el producto. Intentá de nuevo.'),
    );
  }
}

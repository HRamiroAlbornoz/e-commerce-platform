import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminDb } from '../../_lib/firebaseAdmin.js';
import { requireAdmin } from '../../_lib/requireAdmin.js';
import { ProductError, respondWithError } from '../../_lib/productErrors.js';
import {
  deleteProductRequestSchema,
  productSchema,
  type DeleteProductResponse,
} from '../../../shared/schemas/product.js';

const productReferenceCountsSchema = productSchema.pick({ orderCount: true, ratingCount: true });

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

  const parsedBody = deleteProductRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    respondWithError(
      res,
      requestId,
      new ProductError('INVALID_REQUEST', 'La solicitud de borrado no tiene un formato válido.'),
    );
    return;
  }

  const { productId } = parsedBody.data;

  try {
    const productRef = adminDb.doc(`products/${productId}`);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      throw new ProductError('PRODUCT_NOT_FOUND', 'No encontramos ese producto.');
    }

    const { orderCount, ratingCount } = productReferenceCountsSchema.parse(
      productSnap.data() ?? {},
    );

    if (orderCount !== 0 || ratingCount !== 0) {
      throw new ProductError(
        'PRODUCT_HAS_REFERENCES',
        'Este producto tiene ventas o reseñas registradas y no se puede eliminar definitivamente.',
        { orderCount, ratingCount },
      );
    }

    await productRef.delete();

    const response: DeleteProductResponse = { productId };
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof ProductError) {
      respondWithError(res, requestId, err);
      return;
    }

    respondWithError(
      res,
      requestId,
      new ProductError('INTERNAL_ERROR', 'No pudimos eliminar el producto. Intentá de nuevo.'),
    );
  }
}

import type { User } from 'firebase/auth';
import { postJsonRequest } from '@/lib/apiRequest';
import {
  updateProductResponseSchema,
  productErrorResponseSchema,
  type UpdateProductRequest,
} from '@shared/schemas/product';

const GENERIC_UPDATE_ERROR = 'No pudimos actualizar el producto. Intenta de nuevo.';

export type UpdateProductResult = { ok: true } | { ok: false; message: string };

export async function updateProduct(
  user: User,
  request: UpdateProductRequest,
): Promise<UpdateProductResult> {
  const result = await postJsonRequest(
    user,
    '/api/admin/products/update',
    request,
    updateProductResponseSchema,
    productErrorResponseSchema,
    GENERIC_UPDATE_ERROR,
  );

  return result.ok ? { ok: true } : result;
}

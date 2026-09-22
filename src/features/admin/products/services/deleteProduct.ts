import type { User } from 'firebase/auth';
import { postJsonRequest } from '@/lib/apiRequest';
import { deleteProductResponseSchema, productErrorResponseSchema } from '@shared/schemas/product';

const GENERIC_DELETE_ERROR = 'No pudimos eliminar el producto. Intenta de nuevo.';

export type DeleteProductResult = { ok: true } | { ok: false; message: string };

export async function deleteProduct(user: User, productId: string): Promise<DeleteProductResult> {
  const result = await postJsonRequest(
    user,
    '/api/admin/products/delete',
    { productId },
    deleteProductResponseSchema,
    productErrorResponseSchema,
    GENERIC_DELETE_ERROR,
  );

  return result.ok ? { ok: true } : result;
}

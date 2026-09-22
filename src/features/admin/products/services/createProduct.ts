import type { User } from 'firebase/auth';
import { postJsonRequest } from '@/lib/apiRequest';
import {
  createProductResponseSchema,
  productErrorResponseSchema,
  type CreateProductRequest,
} from '@shared/schemas/product';

const GENERIC_CREATE_ERROR = 'No pudimos crear el producto. Intenta de nuevo.';

export type CreateProductResult = { ok: true; productId: string } | { ok: false; message: string };

export async function createProduct(
  user: User,
  input: CreateProductRequest,
): Promise<CreateProductResult> {
  const result = await postJsonRequest(
    user,
    '/api/admin/products/create',
    input,
    createProductResponseSchema,
    productErrorResponseSchema,
    GENERIC_CREATE_ERROR,
  );

  return result.ok ? { ok: true, productId: result.data.productId } : result;
}

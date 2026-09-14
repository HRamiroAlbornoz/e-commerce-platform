import type { User } from 'firebase/auth';
import { postJsonRequest } from '@/lib/apiRequest';
import { recalculateRatingResponseSchema, reviewErrorResponseSchema } from '@shared/schemas/review';

export async function recalculateProductRating(user: User, productId: string): Promise<void> {
  const result = await postJsonRequest(
    user,
    '/api/reviews/recalculate',
    { productId },
    recalculateRatingResponseSchema,
    reviewErrorResponseSchema,
    'No se pudo actualizar el promedio del producto.',
  );

  if (!result.ok) {
    console.error('recalculateProductRating', result.message);
  }
}

import { useCallback } from 'react';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getProductReviews } from '@/features/reviews/services/getProductReviews';
import type { Review } from '@shared/schemas/review';

type ProductReviewsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; reviews: Review[] };

export function useProductReviews(
  productId: string | undefined,
): ProductReviewsState & { retry: () => void } {
  const fetchReviews = useCallback(() => {
    if (!productId) {
      return Promise.resolve([]);
    }
    return getProductReviews(productId);
  }, [productId]);

  const result = useKeyedAsync(
    productId ?? '',
    fetchReviews,
    'No pudimos cargar las reseñas. Intenta de nuevo.',
  );

  if (result.status === 'success') {
    return { status: 'success', reviews: result.data, retry: result.retry };
  }

  return result;
}

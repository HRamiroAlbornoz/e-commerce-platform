import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProductReviews } from '@/features/reviews/hooks/useProductReviews';
import { getProductReviews } from '@/features/reviews/services/getProductReviews';
import type { Review } from '@shared/schemas/review';

vi.mock('@/features/reviews/services/getProductReviews', () => ({
  getProductReviews: vi.fn(),
}));

const reviewFixture: Review = {
  userId: 'user-1',
  displayName: 'Hernán Albornoz',
  rating: 5,
  comment: 'Excelente producto.',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('useProductReviews', () => {
  it('arranca en loading y pasa a success con las reseñas del producto', async () => {
    vi.mocked(getProductReviews).mockResolvedValue([reviewFixture]);

    const { result } = renderHook(() => useProductReviews('product-1'));

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', reviews: [reviewFixture] });
    });
  });

  it('pasa a success con una lista vacia cuando el producto no tiene reseñas', async () => {
    vi.mocked(getProductReviews).mockResolvedValue([]);

    const { result } = renderHook(() => useProductReviews('product-1'));

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', reviews: [] });
    });
  });

  it('sin productId, no llama al servicio y devuelve una lista vacia', async () => {
    const { result } = renderHook(() => useProductReviews(undefined));

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', reviews: [] });
    });
    expect(getProductReviews).not.toHaveBeenCalled();
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getProductReviews).mockRejectedValue(new Error('network-error'));

    const { result } = renderHook(() => useProductReviews('product-1'));

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'error',
        message: 'No pudimos cargar las reseñas. Intenta de nuevo.',
      });
    });
  });
});

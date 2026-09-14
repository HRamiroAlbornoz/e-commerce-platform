import { describe, expect, it, vi } from 'vitest';
import { getProductReviews } from '@/features/reviews/services/getProductReviews';

const { collectionMock, orderByMock, queryMock, getDocsMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'reviews-query-with-converter');
  return {
    collectionMock: vi.fn(() => 'reviews-collection'),
    orderByMock: vi.fn(() => 'orderby-clause'),
    queryMock: vi.fn(() => ({ withConverter: withConverterMock })),
    getDocsMock: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  orderBy: orderByMock,
  query: queryMock,
  getDocs: getDocsMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/review', () => ({ reviewConverter: {} }));

describe('getProductReviews', () => {
  it('consulta la subcoleccion de reseñas del producto, mas nuevas primero', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await getProductReviews('product-1');

    expect(collectionMock).toHaveBeenCalledWith({}, 'products', 'product-1', 'reviews');
    expect(orderByMock).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('devuelve las reseñas ya convertidas', async () => {
    const reviewA = { userId: 'user-1' };
    const reviewB = { userId: 'user-2' };
    getDocsMock.mockResolvedValue({
      metadata: { fromCache: false },
      docs: [{ data: () => reviewA }, { data: () => reviewB }],
    });

    await expect(getProductReviews('product-1')).resolves.toEqual([reviewA, reviewB]);
  });

  it('devuelve una lista vacia cuando el producto no tiene reseñas', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await expect(getProductReviews('product-1')).resolves.toEqual([]);
  });

  it('rechaza si la respuesta viene de la cache local, no del servidor', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: true }, docs: [] });

    await expect(getProductReviews('product-1')).rejects.toThrow();
  });
});

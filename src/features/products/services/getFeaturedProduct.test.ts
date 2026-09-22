import { describe, expect, it, vi } from 'vitest';
import { getFeaturedProduct } from '@/features/products/services/getFeaturedProduct';

const { collectionMock, whereMock, orderByMock, limitMock, queryMock, getDocsMock } = vi.hoisted(
  () => {
    const withConverterMock = vi.fn(() => 'featured-product-query-with-converter');
    return {
      collectionMock: vi.fn(() => 'products-collection'),
      whereMock: vi.fn(() => 'where-is-active'),
      orderByMock: vi.fn(() => 'orderby-created-at'),
      limitMock: vi.fn(() => 'limit-clause'),
      queryMock: vi.fn(() => ({ withConverter: withConverterMock })),
      getDocsMock: vi.fn(),
    };
  },
);

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  where: whereMock,
  orderBy: orderByMock,
  limit: limitMock,
  query: queryMock,
  getDocs: getDocsMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/product', () => ({ productConverter: {} }));

describe('getFeaturedProduct', () => {
  it('consulta el producto activo mas reciente, con limite 1', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await getFeaturedProduct();

    expect(whereMock).toHaveBeenCalledWith('isActive', '==', true);
    expect(orderByMock).toHaveBeenCalledWith('createdAt', 'desc');
    expect(limitMock).toHaveBeenCalledWith(1);
    expect(queryMock).toHaveBeenCalledWith(
      'products-collection',
      'where-is-active',
      'orderby-created-at',
      'limit-clause',
    );
  });

  it('devuelve null cuando no hay ningun producto activo', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await expect(getFeaturedProduct()).resolves.toBeNull();
  });

  it('devuelve el producto ya convertido cuando hay resultado', async () => {
    const featuredProduct = { id: 'product-1', name: 'Teclado Aurora' };
    getDocsMock.mockResolvedValue({
      metadata: { fromCache: false },
      docs: [{ data: () => featuredProduct }],
    });

    await expect(getFeaturedProduct()).resolves.toEqual(featuredProduct);
  });

  it('rechaza si la respuesta viene de la cache local, no del servidor', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: true }, docs: [] });

    await expect(getFeaturedProduct()).rejects.toThrow();
  });
});

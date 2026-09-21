import { describe, expect, it, vi } from 'vitest';
import { getTopSellingProducts } from '@/features/admin/analytics/services/getTopSellingProducts';

const { collectionMock, whereMock, orderByMock, limitMock, queryMock, getDocsMock } = vi.hoisted(
  () => {
    const withConverterMock = vi.fn(() => 'top-products-query-with-converter');
    return {
      collectionMock: vi.fn(() => 'products-collection'),
      whereMock: vi.fn(() => 'where-units-sold'),
      orderByMock: vi.fn(() => 'orderby-units-sold'),
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

describe('getTopSellingProducts', () => {
  it('consulta productos con ventas ordenados de mas a menos vendido, con limite (F12.1, F12.6)', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await getTopSellingProducts();

    expect(whereMock).toHaveBeenCalledWith('unitsSold', '>', 0);
    expect(orderByMock).toHaveBeenCalledWith('unitsSold', 'desc');
    expect(limitMock).toHaveBeenCalledWith(5);
    expect(queryMock).toHaveBeenCalledWith(
      'products-collection',
      'where-units-sold',
      'orderby-units-sold',
      'limit-clause',
    );
    expect(getDocsMock).toHaveBeenCalledTimes(1);
  });

  it('devuelve los productos ya convertidos', async () => {
    const productA = { id: 'product-1', unitsSold: 10 };
    getDocsMock.mockResolvedValue({
      metadata: { fromCache: false },
      docs: [{ data: () => productA }],
    });

    await expect(getTopSellingProducts()).resolves.toEqual([productA]);
  });

  it('rechaza si la respuesta viene de la cache local, no del servidor', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: true }, docs: [] });

    await expect(getTopSellingProducts()).rejects.toThrow();
  });
});

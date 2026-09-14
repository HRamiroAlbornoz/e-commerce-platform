import { describe, expect, it, vi } from 'vitest';
import { getOrders } from '@/features/orders/services/getOrders';

const { collectionMock, whereMock, orderByMock, queryMock, getDocsMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'orders-query-with-converter');
  return {
    collectionMock: vi.fn(() => 'orders-collection'),
    whereMock: vi.fn(() => 'where-clause'),
    orderByMock: vi.fn(() => 'orderby-clause'),
    queryMock: vi.fn(() => ({ withConverter: withConverterMock })),
    getDocsMock: vi.fn(),
  };
});

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  where: whereMock,
  orderBy: orderByMock,
  query: queryMock,
  getDocs: getDocsMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/order', () => ({ orderConverter: {} }));

describe('getOrders', () => {
  it('consulta solo las ordenes del usuario, mas nuevas primero', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await getOrders('user-1');

    expect(collectionMock).toHaveBeenCalledWith({}, 'orders');
    expect(whereMock).toHaveBeenCalledWith('userId', '==', 'user-1');
    expect(orderByMock).toHaveBeenCalledWith('createdAt', 'desc');
  });

  it('devuelve las ordenes ya convertidas', async () => {
    const orderA = { id: 'order-1' };
    const orderB = { id: 'order-2' };
    getDocsMock.mockResolvedValue({
      metadata: { fromCache: false },
      docs: [{ data: () => orderA }, { data: () => orderB }],
    });

    await expect(getOrders('user-1')).resolves.toEqual([orderA, orderB]);
  });

  it('devuelve una lista vacia cuando el usuario no tiene ordenes', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await expect(getOrders('user-1')).resolves.toEqual([]);
  });

  it('rechaza si la respuesta viene de la cache local, no del servidor', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: true }, docs: [] });

    await expect(getOrders('user-1')).rejects.toThrow();
  });
});

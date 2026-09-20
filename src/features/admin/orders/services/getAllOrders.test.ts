import { describe, expect, it, vi } from 'vitest';
import { getAllOrders } from '@/features/admin/orders/services/getAllOrders';

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

describe('getAllOrders', () => {
  it('sin filtro, consulta todas las ordenes ordenadas por fecha, sin where', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await getAllOrders(undefined);

    expect(collectionMock).toHaveBeenCalledWith({}, 'orders');
    expect(whereMock).not.toHaveBeenCalled();
    expect(orderByMock).toHaveBeenCalledWith('createdAt', 'desc');
    expect(queryMock).toHaveBeenCalledWith('orders-collection', 'orderby-clause');
  });

  it('con un estado, filtra por status ademas de ordenar por fecha (F11.2)', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await getAllOrders('pending');

    expect(whereMock).toHaveBeenCalledWith('status', '==', 'pending');
    expect(queryMock).toHaveBeenCalledWith('orders-collection', 'where-clause', 'orderby-clause');
  });

  it('devuelve las ordenes ya convertidas', async () => {
    const orderA = { id: 'order-1' };
    const orderB = { id: 'order-2' };
    getDocsMock.mockResolvedValue({
      metadata: { fromCache: false },
      docs: [{ data: () => orderA }, { data: () => orderB }],
    });

    await expect(getAllOrders(undefined)).resolves.toEqual([orderA, orderB]);
  });

  it('rechaza si la respuesta viene de la cache local, no del servidor', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: true }, docs: [] });

    await expect(getAllOrders(undefined)).rejects.toThrow();
  });
});

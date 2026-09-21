import { describe, expect, it, vi } from 'vitest';
import { getOrdersSummary } from '@/features/admin/analytics/services/getOrdersSummary';

const { collectionMock, whereMock, queryMock, sumMock, countMock, getAggregateFromServerMock } =
  vi.hoisted(() => ({
    collectionMock: vi.fn(() => 'orders-collection'),
    whereMock: vi.fn(() => 'where-not-cancelled'),
    queryMock: vi.fn(() => 'non-cancelled-orders-query'),
    sumMock: vi.fn((field: string) => ({ __sum: field })),
    countMock: vi.fn(() => ({ __count: true })),
    getAggregateFromServerMock: vi.fn(),
  }));

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  where: whereMock,
  query: queryMock,
  sum: sumMock,
  count: countMock,
  getAggregateFromServer: getAggregateFromServerMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));

describe('getOrdersSummary', () => {
  it('agrega sum(total) y count() sobre ordenes no canceladas, sin traer documentos (F12.2)', async () => {
    getAggregateFromServerMock.mockResolvedValue({
      data: () => ({ totalRevenue: 189998, totalOrders: 2 }),
    });

    await getOrdersSummary();

    expect(whereMock).toHaveBeenCalledWith('status', '!=', 'cancelled');
    expect(queryMock).toHaveBeenCalledWith('orders-collection', 'where-not-cancelled');
    expect(sumMock).toHaveBeenCalledWith('total');
    expect(getAggregateFromServerMock).toHaveBeenCalledWith('non-cancelled-orders-query', {
      totalRevenue: { __sum: 'total' },
      totalOrders: { __count: true },
    });
  });

  it('normaliza sum/count nulos a 0 cuando no hay ordenes (F12.4)', async () => {
    getAggregateFromServerMock.mockResolvedValue({
      data: () => ({ totalRevenue: null, totalOrders: null }),
    });

    await expect(getOrdersSummary()).resolves.toEqual({ totalRevenue: 0, totalOrders: 0 });
  });

  it('redondea el ingreso total a centavos, cubriendo error de punto flotante', async () => {
    getAggregateFromServerMock.mockResolvedValue({
      data: () => ({ totalRevenue: 19.999999999999996, totalOrders: 1 }),
    });

    await expect(getOrdersSummary()).resolves.toEqual({ totalRevenue: 20, totalOrders: 1 });
  });
});

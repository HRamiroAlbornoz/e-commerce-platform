import { describe, expect, it, vi } from 'vitest';
import { getAdminProducts } from '@/features/admin/products/services/getAdminProducts';

const { whereMock, orderByMock, queryMock, getDocsMock, collectionMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'products-ref-with-converter');
  return {
    whereMock: vi.fn(),
    orderByMock: vi.fn((field: string, direction?: string) => ({
      type: 'orderBy',
      field,
      direction,
    })),
    queryMock: vi.fn((_ref: unknown, ...constraints: unknown[]) => constraints),
    getDocsMock: vi.fn(),
    collectionMock: vi.fn(() => ({ withConverter: withConverterMock })),
  };
});

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  getDocs: getDocsMock,
  orderBy: orderByMock,
  query: queryMock,
  where: whereMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/product', () => ({ productConverter: {} }));

describe('getAdminProducts', () => {
  it('trae todos los productos sin filtrar por isActive (a diferencia de getActiveProducts)', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await getAdminProducts();

    expect(whereMock).not.toHaveBeenCalled();
  });

  it('devuelve los productos, activos e inactivos por igual', async () => {
    const activeProduct = { id: 'p1', isActive: true };
    const retiredProduct = { id: 'p2', isActive: false };
    getDocsMock.mockResolvedValue({
      metadata: { fromCache: false },
      docs: [{ data: () => activeProduct }, { data: () => retiredProduct }],
    });

    await expect(getAdminProducts()).resolves.toEqual([activeProduct, retiredProduct]);
  });

  it('rechaza el resultado si la respuesta viene de la cache local', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: true }, docs: [] });

    await expect(getAdminProducts()).rejects.toThrow(
      'No se pudo confirmar el catálogo con el servidor.',
    );
  });
});

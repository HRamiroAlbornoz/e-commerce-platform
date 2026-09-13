import { describe, expect, it, vi } from 'vitest';
import { getProductsByIds } from '@/features/products/services/getProductsByIds';

const { collectionMock, getDocsMock, queryMock, whereMock, documentIdMock } = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'products-collection-with-converter');
  return {
    collectionMock: vi.fn(() => ({ withConverter: withConverterMock })),
    getDocsMock: vi.fn(),
    queryMock: vi.fn((...args: unknown[]) => ({ queryArgs: args })),
    whereMock: vi.fn((...args: unknown[]) => ({ whereArgs: args })),
    documentIdMock: vi.fn(() => '__name__'),
  };
});

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  documentId: documentIdMock,
  getDocs: getDocsMock,
  query: queryMock,
  where: whereMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/product', () => ({ productConverter: {} }));

function buildProduct(id: string) {
  return { id, name: `Producto ${id}`, isActive: true };
}

describe('getProductsByIds', () => {
  it('con una lista vacia, no consulta Firestore', async () => {
    await expect(getProductsByIds([])).resolves.toEqual([]);
    expect(getDocsMock).not.toHaveBeenCalled();
  });

  it('arma un where("in") con los ids pedidos, en una sola consulta', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs: [] });

    await getProductsByIds(['product-1', 'product-2']);

    expect(whereMock).toHaveBeenCalledWith('__name__', 'in', ['product-1', 'product-2']);
    expect(getDocsMock).toHaveBeenCalledTimes(1);
  });

  it('devuelve los productos encontrados', async () => {
    const products = [buildProduct('product-1'), buildProduct('product-2')];
    getDocsMock.mockResolvedValue({
      metadata: { fromCache: false },
      docs: products.map((product) => ({ data: () => product })),
    });

    await expect(getProductsByIds(['product-1', 'product-2'])).resolves.toEqual(products);
  });
});

import { describe, expect, it, vi } from 'vitest';
import {
  getActiveProducts,
  PRODUCTS_PAGE_SIZE,
} from '@/features/products/services/getActiveProducts';

type RecordedConstraint = {
  type: string;
  field?: string | undefined;
  op?: string | undefined;
  value?: unknown;
  direction?: string | undefined;
};

const {
  whereMock,
  orderByMock,
  limitMock,
  startAfterMock,
  queryMock,
  getDocsMock,
  collectionMock,
} = vi.hoisted(() => {
  const withConverterMock = vi.fn(() => 'products-ref-with-converter');
  return {
    whereMock: vi.fn((field: string, op: string, value: unknown): RecordedConstraint => ({
      type: 'where',
      field,
      op,
      value,
    })),
    orderByMock: vi.fn((field: string, direction?: string): RecordedConstraint => ({
      type: 'orderBy',
      field,
      direction,
    })),
    limitMock: vi.fn((value: number): RecordedConstraint => ({ type: 'limit', value })),
    startAfterMock: vi.fn((cursor: unknown): RecordedConstraint => ({
      type: 'startAfter',
      value: cursor,
    })),
    queryMock: vi.fn((_ref: unknown, ...constraints: RecordedConstraint[]) => constraints),
    getDocsMock: vi.fn(),
    collectionMock: vi.fn(() => ({ withConverter: withConverterMock })),
  };
});

vi.mock('firebase/firestore', () => ({
  collection: collectionMock,
  getDocs: getDocsMock,
  limit: limitMock,
  orderBy: orderByMock,
  query: queryMock,
  startAfter: startAfterMock,
  where: whereMock,
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));
vi.mock('@/lib/firebase/converters/product', () => ({ productConverter: {} }));

function mockSnapshot(docCount: number) {
  const docs = Array.from({ length: docCount }, (_, index) => ({
    data: () => ({ id: `product-${index}` }),
  }));
  getDocsMock.mockResolvedValue({ metadata: { fromCache: false }, docs });
}

function lastQueriedConstraints(): RecordedConstraint[] {
  const lastCall = queryMock.mock.calls.at(-1) as unknown as [unknown, ...RecordedConstraint[]];
  return lastCall.slice(1) as RecordedConstraint[];
}

describe('getActiveProducts', () => {
  it('sin filtros, ordena por fecha de creacion descendente y pide una pagina de mas para saber si hay siguiente', async () => {
    mockSnapshot(0);

    await getActiveProducts();

    expect(lastQueriedConstraints()).toEqual([
      { type: 'where', field: 'isActive', op: '==', value: true },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' },
      { type: 'limit', value: PRODUCTS_PAGE_SIZE + 1 },
    ]);
  });

  it('con categoria, agrega la igualdad y mantiene el orden por fecha', async () => {
    mockSnapshot(0);

    await getActiveProducts({ category: 'keyboard' });

    expect(lastQueriedConstraints()).toEqual([
      { type: 'where', field: 'isActive', op: '==', value: true },
      { type: 'where', field: 'category', op: '==', value: 'keyboard' },
      { type: 'orderBy', field: 'createdAt', direction: 'desc' },
      { type: 'limit', value: PRODUCTS_PAGE_SIZE + 1 },
    ]);
  });

  it('con termino de busqueda, filtra por prefijo de nameLower y ordena por ese campo', async () => {
    mockSnapshot(0);

    await getActiveProducts({ searchTerm: 'Teclado' });

    const constraints = lastQueriedConstraints();
    expect(constraints[0]).toEqual({ type: 'where', field: 'isActive', op: '==', value: true });
    expect(constraints[1]).toEqual({
      type: 'where',
      field: 'nameLower',
      op: '>=',
      value: 'teclado',
    });
    expect(constraints[2]).toMatchObject({ type: 'where', field: 'nameLower', op: '<' });
    const upperBoundValue = constraints[2]?.value as string;
    expect(upperBoundValue.startsWith('teclado')).toBe(true);
    expect(upperBoundValue > 'teclado').toBe(true);
    expect(constraints[3]).toEqual({ type: 'orderBy', field: 'nameLower', direction: undefined });
    expect(constraints[4]).toEqual({ type: 'limit', value: PRODUCTS_PAGE_SIZE + 1 });
  });

  it('combina categoria y busqueda en la misma consulta', async () => {
    mockSnapshot(0);

    await getActiveProducts({ category: 'mouse', searchTerm: 'logi' });

    const constraints = lastQueriedConstraints();
    expect(constraints[0]).toEqual({ type: 'where', field: 'isActive', op: '==', value: true });
    expect(constraints[1]).toEqual({ type: 'where', field: 'category', op: '==', value: 'mouse' });
    expect(constraints[2]).toEqual({
      type: 'where',
      field: 'nameLower',
      op: '>=',
      value: 'logi',
    });
    expect(constraints[3]).toMatchObject({ type: 'where', field: 'nameLower', op: '<' });
    expect(constraints[4]).toEqual({ type: 'orderBy', field: 'nameLower', direction: undefined });
    expect(constraints[5]).toEqual({ type: 'limit', value: PRODUCTS_PAGE_SIZE + 1 });
  });

  it('con un cursor, agrega startAfter antes del limit', async () => {
    mockSnapshot(0);
    const cursor = { id: 'last-doc' } as never;

    await getActiveProducts({}, cursor);

    const constraints = lastQueriedConstraints();
    expect(constraints.at(-2)).toEqual({ type: 'startAfter', value: cursor });
    expect(constraints.at(-1)).toEqual({ type: 'limit', value: PRODUCTS_PAGE_SIZE + 1 });
  });

  it('cuando llegan mas documentos que el tamano de pagina, recorta y marca hasNextPage', async () => {
    mockSnapshot(PRODUCTS_PAGE_SIZE + 1);

    const result = await getActiveProducts();

    expect(result.products).toHaveLength(PRODUCTS_PAGE_SIZE);
    expect(result.hasNextPage).toBe(true);
  });

  it('cuando llegan menos documentos que el tamano de pagina, no hay siguiente', async () => {
    mockSnapshot(3);

    const result = await getActiveProducts();

    expect(result.products).toHaveLength(3);
    expect(result.hasNextPage).toBe(false);
  });

  it('rechaza el resultado si la respuesta viene de la cache local', async () => {
    getDocsMock.mockResolvedValue({ metadata: { fromCache: true }, docs: [] });

    await expect(getActiveProducts()).rejects.toThrow(
      'No se pudo confirmar el catalogo con el servidor.',
    );
  });
});

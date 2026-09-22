import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useActiveProducts } from '@/features/products/hooks/useActiveProducts';
import {
  getActiveProducts,
  type ProductsPage,
} from '@/features/products/services/getActiveProducts';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/products/services/getActiveProducts', () => ({
  getActiveProducts: vi.fn(),
}));

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Teclado mecanico RGB Aurora TKL',
    nameLower: 'teclado mecanico rgb aurora tkl',
    description: 'Teclado mecanico TKL con switches lineales.',
    price: 89999,
    stock: 40,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Switches', value: 'Lineales rojos' }],
    curatorialNote: 'Lo probamos dos semanas escribiendo largo y jugando shooters.',
    ratingAverage: 4.5,
    ratingCount: 12,
    orderCount: 3,
    unitsSold: 5,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-02T00:00:00Z'),
    ...overrides,
  };
}

function buildPage(products: Product[], overrides: Partial<ProductsPage> = {}): ProductsPage {
  return { products, lastDoc: null, hasNextPage: false, ...overrides };
}

describe('useActiveProducts', () => {
  beforeEach(() => {
    vi.mocked(getActiveProducts).mockReset();
  });

  it('arranca en loading y pasa a success con los productos de la pagina 1', async () => {
    const page1 = buildPage([buildProduct()], { hasNextPage: true, lastDoc: {} as never });
    vi.mocked(getActiveProducts).mockResolvedValue(page1);

    const { result } = renderHook(() => useActiveProducts({}, 1));

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(result.current).toMatchObject({
      status: 'success',
      products: page1.products,
      hasNextPage: true,
    });
    expect(getActiveProducts).toHaveBeenCalledWith({ category: undefined, searchTerm: undefined });
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getActiveProducts).mockRejectedValue(new Error('permission-denied'));

    const { result } = renderHook(() => useActiveProducts({}, 1));

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current).toMatchObject({
      status: 'error',
      message: 'No pudimos cargar el catalogo. Intenta de nuevo.',
    });
  });

  it('retry vuelve a consultar y puede recuperarse de un error', async () => {
    vi.mocked(getActiveProducts).mockRejectedValueOnce(new Error('network-error'));
    vi.mocked(getActiveProducts).mockResolvedValueOnce(buildPage([buildProduct()]));

    const { result } = renderHook(() => useActiveProducts({}, 1));

    await waitFor(() => expect(result.current.status).toBe('error'));

    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(getActiveProducts).toHaveBeenCalledTimes(2);
  });

  it('avanzar de pagina reusa el cursor cacheado: una sola consulta por pagina nueva', async () => {
    const lastDocPage1 = { id: 'cursor-1' } as never;
    vi.mocked(getActiveProducts).mockResolvedValueOnce(
      buildPage([buildProduct()], { hasNextPage: true, lastDoc: lastDocPage1 }),
    );

    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useActiveProducts({}, page),
      {
        initialProps: { page: 1 },
      },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));

    vi.mocked(getActiveProducts).mockResolvedValueOnce(
      buildPage([buildProduct({ id: 'product-2' })], { hasNextPage: false }),
    );
    rerender({ page: 2 });

    await waitFor(() =>
      expect(result.current).toMatchObject({ status: 'success', hasNextPage: false }),
    );

    expect(getActiveProducts).toHaveBeenCalledTimes(2);
    expect(getActiveProducts).toHaveBeenNthCalledWith(
      2,
      { category: undefined, searchTerm: undefined },
      lastDocPage1,
    );
  });

  it('volver a una pagina ya visitada no vuelve a consultar Firestore', async () => {
    const lastDocPage1 = { id: 'cursor-1' } as never;
    vi.mocked(getActiveProducts)
      .mockResolvedValueOnce(
        buildPage([buildProduct()], { hasNextPage: true, lastDoc: lastDocPage1 }),
      )
      .mockResolvedValueOnce(
        buildPage([buildProduct({ id: 'product-2' })], { hasNextPage: false }),
      );

    const { result, rerender } = renderHook(
      ({ page }: { page: number }) => useActiveProducts({}, page),
      {
        initialProps: { page: 1 },
      },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));
    rerender({ page: 2 });
    await waitFor(() => expect(result.current.status).toBe('success'));

    rerender({ page: 1 });

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', products: [buildProduct()] });
    });
    expect(getActiveProducts).toHaveBeenCalledTimes(2);
  });

  it('un deep link directo a una pagina posterior encadena los fetches necesarios', async () => {
    const lastDocPage1 = { id: 'cursor-1' } as never;
    const lastDocPage2 = { id: 'cursor-2' } as never;
    vi.mocked(getActiveProducts)
      .mockResolvedValueOnce(
        buildPage([buildProduct({ id: 'page-1' })], { hasNextPage: true, lastDoc: lastDocPage1 }),
      )
      .mockResolvedValueOnce(
        buildPage([buildProduct({ id: 'page-2' })], { hasNextPage: true, lastDoc: lastDocPage2 }),
      )
      .mockResolvedValueOnce(buildPage([buildProduct({ id: 'page-3' })], { hasNextPage: false }));

    const { result } = renderHook(() => useActiveProducts({}, 3));

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'success',
        products: [buildProduct({ id: 'page-3' })],
      });
    });

    expect(getActiveProducts).toHaveBeenCalledTimes(3);
    expect(getActiveProducts).toHaveBeenNthCalledWith(1, {
      category: undefined,
      searchTerm: undefined,
    });
    expect(getActiveProducts).toHaveBeenNthCalledWith(
      2,
      { category: undefined, searchTerm: undefined },
      lastDocPage1,
    );
    expect(getActiveProducts).toHaveBeenNthCalledWith(
      3,
      { category: undefined, searchTerm: undefined },
      lastDocPage2,
    );
  });

  it('cambiar la categoria descarta los cursores cacheados y vuelve a consultar desde el principio', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(buildPage([buildProduct()]));

    const { result, rerender } = renderHook(
      ({ category }: { category?: 'keyboard' | 'mouse' | undefined }) =>
        useActiveProducts({ category }, 1),
      { initialProps: {} },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));

    rerender({ category: 'mouse' });

    await waitFor(() => {
      expect(getActiveProducts).toHaveBeenLastCalledWith({
        category: 'mouse',
        searchTerm: undefined,
      });
    });
  });

  it('pedir una pagina mas alla de la ultima real se queda en la ultima pagina disponible', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue(
      buildPage([buildProduct({ id: 'unica-pagina' })], { hasNextPage: false }),
    );

    const { result } = renderHook(() => useActiveProducts({}, 5));

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'success',
        products: [buildProduct({ id: 'unica-pagina' })],
        hasNextPage: false,
      });
    });

    expect(getActiveProducts).toHaveBeenCalledTimes(1);
  });
});

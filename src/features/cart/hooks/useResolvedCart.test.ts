import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useResolvedCart } from '@/features/cart/hooks/useResolvedCart';
import { useCart } from '@/hooks/useCart';
import { getProductsByIds } from '@/features/products/services/getProductsByIds';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';
import type { Product } from '@shared/schemas/product';

vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));
vi.mock('@/features/products/services/getProductsByIds', () => ({ getProductsByIds: vi.fn() }));

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    name: 'Teclado mecanico X',
    nameLower: 'teclado mecanico x',
    description: 'Descripcion',
    price: 0.1,
    stock: 5,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Switches', value: 'Lineales' }],
    curatorialNote: 'Nota',
    ratingAverage: 0,
    ratingCount: 0,
    orderCount: 0,
    unitsSold: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('useResolvedCart', () => {
  it('con el carrito vacio, resuelve directo a exito sin consultar productos', async () => {
    vi.mocked(useCart).mockReturnValue(buildCartContextValue({ items: [] }));

    const { result } = renderHook(() => useResolvedCart());

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current).toMatchObject({ status: 'success', lines: [], total: 0 });
    expect(getProductsByIds).not.toHaveBeenCalled();
  });

  it('calcula el total redondeado a centavos, incluso con error de punto flotante (F5.3)', async () => {
    vi.mocked(useCart).mockReturnValue(
      buildCartContextValue({ items: [{ productId: 'product-1', quantity: 3 }] }),
    );
    vi.mocked(getProductsByIds).mockResolvedValue([buildProduct({ price: 0.1 })]);

    const { result } = renderHook(() => useResolvedCart());

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current).toMatchObject({
      status: 'success',
      lines: [{ quantity: 3, lineTotal: 0.3 }],
      total: 0.3,
    });
  });

  it('un producto que ya no existe en el catalogo se excluye de las lineas mostradas', async () => {
    vi.mocked(useCart).mockReturnValue(
      buildCartContextValue({
        items: [
          { productId: 'product-1', quantity: 1 },
          { productId: 'borrado', quantity: 1 },
        ],
      }),
    );
    vi.mocked(getProductsByIds).mockResolvedValue([buildProduct({ price: 100 })]);

    const { result } = renderHook(() => useResolvedCart());

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current).toMatchObject({ status: 'success', total: 100 });
    if (result.current.status === 'success') {
      expect(result.current.lines).toHaveLength(1);
    }
  });

  it('si la consulta falla, pasa a error con un mensaje amigable', async () => {
    vi.mocked(useCart).mockReturnValue(
      buildCartContextValue({ items: [{ productId: 'product-1', quantity: 1 }] }),
    );
    vi.mocked(getProductsByIds).mockRejectedValue(new Error('network-error'));

    const { result } = renderHook(() => useResolvedCart());

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current).toMatchObject({ message: 'No pudimos cargar el carrito. Intenta de nuevo.' });
  });
});

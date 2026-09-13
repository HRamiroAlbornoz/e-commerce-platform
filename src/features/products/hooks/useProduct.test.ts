import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useProduct } from '@/features/products/hooks/useProduct';
import { getProductById } from '@/features/products/services/getProductById';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/products/services/getProductById', () => ({
  getProductById: vi.fn(),
}));

const productFixture: Product = {
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
  curatorialNote: 'Nota curatorial de prueba.',
  ratingAverage: 4.5,
  ratingCount: 12,
  orderCount: 3,
  unitsSold: 5,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-02T00:00:00Z'),
};

describe('useProduct', () => {
  it('arranca en loading y pasa a success con el producto', async () => {
    vi.mocked(getProductById).mockResolvedValue(productFixture);

    const { result } = renderHook(() => useProduct('product-1'));

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current).toMatchObject({ status: 'success', product: productFixture });
  });

  it('pasa a not-found cuando el servicio devuelve null', async () => {
    vi.mocked(getProductById).mockResolvedValue(null);

    const { result } = renderHook(() => useProduct('missing'));

    await waitFor(() => {
      expect(result.current.status).toBe('not-found');
    });
  });

  it('sin id, es not-found de inmediato y no llama al servicio', () => {
    const { result } = renderHook(() => useProduct(undefined));

    expect(result.current.status).toBe('not-found');
    expect(getProductById).not.toHaveBeenCalled();
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getProductById).mockRejectedValue(new Error('permission-denied'));

    const { result } = renderHook(() => useProduct('product-1'));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current).toMatchObject({
      status: 'error',
      message: 'No pudimos cargar el producto. Intenta de nuevo.',
    });
  });

  it('retry vuelve a consultar y puede recuperarse de un error', async () => {
    vi.mocked(getProductById).mockRejectedValueOnce(new Error('network-error'));
    vi.mocked(getProductById).mockResolvedValueOnce(productFixture);

    const { result } = renderHook(() => useProduct('product-1'));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(getProductById).toHaveBeenCalledTimes(2);
  });
});

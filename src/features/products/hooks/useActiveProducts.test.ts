import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useActiveProducts } from '@/features/products/hooks/useActiveProducts';
import { getActiveProducts } from '@/features/products/services/getActiveProducts';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/products/services/getActiveProducts', () => ({
  getActiveProducts: vi.fn(),
}));

const productFixture: Product = {
  id: 'product-1',
  name: 'Teclado mecanico RGB Aurora TKL',
  nameLower: 'teclado mecanico rgb aurora tkl',
  description: 'Teclado mecanico TKL con switches lineales.',
  price: 89999,
  stock: 40,
  category: 'keyboard',
  color: 'rgb',
  imageUrl: 'https://placehold.co/600x400',
  isActive: true,
  ratingAverage: 4.5,
  ratingCount: 12,
  orderCount: 3,
  unitsSold: 5,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-02T00:00:00Z'),
};

describe('useActiveProducts', () => {
  it('arranca en loading y pasa a success con los productos', async () => {
    vi.mocked(getActiveProducts).mockResolvedValue([productFixture]);

    const { result } = renderHook(() => useActiveProducts());

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current).toMatchObject({ status: 'success', products: [productFixture] });
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getActiveProducts).mockRejectedValue(new Error('permission-denied'));

    const { result } = renderHook(() => useActiveProducts());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current).toMatchObject({
      status: 'error',
      message: 'No pudimos cargar el catalogo. Intenta de nuevo.',
    });
  });

  it('retry vuelve a consultar y puede recuperarse de un error', async () => {
    vi.mocked(getActiveProducts).mockRejectedValueOnce(new Error('network-error'));
    vi.mocked(getActiveProducts).mockResolvedValueOnce([productFixture]);

    const { result } = renderHook(() => useActiveProducts());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(getActiveProducts).toHaveBeenCalledTimes(2);
  });
});

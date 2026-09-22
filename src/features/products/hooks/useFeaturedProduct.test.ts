import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFeaturedProduct } from '@/features/products/hooks/useFeaturedProduct';
import { getFeaturedProduct } from '@/features/products/services/getFeaturedProduct';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/products/services/getFeaturedProduct', () => ({
  getFeaturedProduct: vi.fn(),
}));

const productFixture: Product = {
  id: 'product-1',
  name: 'Teclado Aurora',
  nameLower: 'teclado aurora',
  description: 'Teclado mecánico.',
  price: 89999,
  stock: 10,
  category: 'keyboard',
  displayColor: 'lime',
  imageUrl: 'https://placehold.co/600x400',
  isActive: true,
  specs: [{ label: 'Switches', value: 'Rojos' }],
  curatorialNote: 'Para quien escribe rápido.',
  ratingAverage: 4.5,
  ratingCount: 2,
  orderCount: 3,
  unitsSold: 8,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('useFeaturedProduct', () => {
  it('arranca en loading y pasa a success con la pieza destacada', async () => {
    vi.mocked(getFeaturedProduct).mockResolvedValue(productFixture);

    const { result } = renderHook(() => useFeaturedProduct());

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', product: productFixture });
    });
  });

  it('pasa a success con null cuando no hay ningun producto activo', async () => {
    vi.mocked(getFeaturedProduct).mockResolvedValue(null);

    const { result } = renderHook(() => useFeaturedProduct());

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', product: null });
    });
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getFeaturedProduct).mockRejectedValue(new Error('network-error'));

    const { result } = renderHook(() => useFeaturedProduct());

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'error',
        message: 'No pudimos cargar la pieza destacada. Intentá de nuevo.',
      });
    });
  });
});

import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTopSellingProducts } from '@/features/admin/analytics/hooks/useTopSellingProducts';
import { getTopSellingProducts } from '@/features/admin/analytics/services/getTopSellingProducts';
import type { Product } from '@shared/schemas/product';

vi.mock('@/features/admin/analytics/services/getTopSellingProducts', () => ({
  getTopSellingProducts: vi.fn(),
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

describe('useTopSellingProducts', () => {
  it('arranca en loading y pasa a success con el ranking (F12.1)', async () => {
    vi.mocked(getTopSellingProducts).mockResolvedValue([productFixture]);

    const { result } = renderHook(() => useTopSellingProducts());

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', products: [productFixture] });
    });
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getTopSellingProducts).mockRejectedValue(new Error('network-error'));

    const { result } = renderHook(() => useTopSellingProducts());

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'error',
        message: 'No pudimos cargar el ranking de productos. Intenta de nuevo.',
      });
    });
  });
});

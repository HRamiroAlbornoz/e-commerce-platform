import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { getOrders } from '@/features/orders/services/getOrders';
import type { Order } from '@shared/schemas/order';

vi.mock('@/features/orders/services/getOrders', () => ({
  getOrders: vi.fn(),
}));

const orderFixture: Order = {
  id: 'order-1',
  userId: 'user-1',
  items: [
    { productId: 'product-1', name: 'Teclado Aurora', unitPrice: 89999, imageUrl: 'https://placehold.co/600x400', quantity: 1 },
  ],
  subtotal: 89999,
  shippingCost: 4999,
  total: 94998,
  status: 'pending',
  shipping: {
    fullName: 'Hernán Albornoz',
    address: 'Av. Siempre Viva 742',
    city: 'Springfield',
    postalCode: '1000',
    phone: '1122334455',
  },
  payment: { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' },
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('useOrders', () => {
  it('arranca en loading y pasa a success con las ordenes del usuario', async () => {
    vi.mocked(getOrders).mockResolvedValue([orderFixture]);

    const { result } = renderHook(() => useOrders('user-1'));

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', orders: [orderFixture] });
    });
  });

  it('pasa a success con una lista vacia cuando el usuario no compro nunca', async () => {
    vi.mocked(getOrders).mockResolvedValue([]);

    const { result } = renderHook(() => useOrders('user-1'));

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', orders: [] });
    });
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getOrders).mockRejectedValue(new Error('network-error'));

    const { result } = renderHook(() => useOrders('user-1'));

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'error',
        message: 'No pudimos cargar tus órdenes. Intenta de nuevo.',
      });
    });
  });
});

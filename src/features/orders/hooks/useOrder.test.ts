import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useOrder } from '@/features/orders/hooks/useOrder';
import { getOrderById } from '@/features/orders/services/getOrderById';
import type { Order } from '@shared/schemas/order';

vi.mock('@/features/orders/services/getOrderById', () => ({
  getOrderById: vi.fn(),
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

describe('useOrder', () => {
  it('arranca en loading y pasa a success con la orden', async () => {
    vi.mocked(getOrderById).mockResolvedValue(orderFixture);

    const { result } = renderHook(() => useOrder('order-1'));

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current).toMatchObject({ status: 'success', order: orderFixture });
  });

  it('pasa a not-found cuando el servicio devuelve null (no existe o es de otro usuario)', async () => {
    vi.mocked(getOrderById).mockResolvedValue(null);

    const { result } = renderHook(() => useOrder('missing'));

    await waitFor(() => {
      expect(result.current.status).toBe('not-found');
    });
  });

  it('sin id, es not-found de inmediato y no llama al servicio', () => {
    const { result } = renderHook(() => useOrder(undefined));

    expect(result.current.status).toBe('not-found');
    expect(getOrderById).not.toHaveBeenCalled();
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getOrderById).mockRejectedValue(new Error('network-error'));

    const { result } = renderHook(() => useOrder('order-1'));

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current).toMatchObject({
      status: 'error',
      message: 'No pudimos cargar la orden. Intenta de nuevo.',
    });
  });

  it('retry vuelve a consultar, por ejemplo despues de cancelar la orden', async () => {
    vi.mocked(getOrderById).mockResolvedValueOnce(orderFixture);
    vi.mocked(getOrderById).mockResolvedValueOnce({ ...orderFixture, status: 'cancelled' });

    const { result } = renderHook(() => useOrder('order-1'));

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    act(() => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', order: { status: 'cancelled' } });
    });

    expect(getOrderById).toHaveBeenCalledTimes(2);
  });
});

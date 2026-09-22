import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAdminOrders } from '@/features/admin/orders/hooks/useAdminOrders';
import { getAllOrders } from '@/features/admin/orders/services/getAllOrders';
import type { Order } from '@shared/schemas/order';

vi.mock('@/features/admin/orders/services/getAllOrders', () => ({
  getAllOrders: vi.fn(),
}));

const orderFixture: Order = {
  id: 'order-1',
  userId: 'user-1',
  items: [
    {
      productId: 'product-1',
      name: 'Teclado Aurora',
      unitPrice: 89999,
      imageUrl: 'https://placehold.co/600x400',
      quantity: 1,
    },
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

describe('useAdminOrders', () => {
  it('arranca en loading y pasa a success con todas las ordenes (F11.1)', async () => {
    vi.mocked(getAllOrders).mockResolvedValue([orderFixture]);

    const { result } = renderHook(() => useAdminOrders(undefined));

    expect(result.current.status).toBe('loading');

    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', orders: [orderFixture] });
    });
    expect(getAllOrders).toHaveBeenCalledWith(undefined);
  });

  it('pasa el filtro de estado al servicio (F11.2)', async () => {
    vi.mocked(getAllOrders).mockResolvedValue([orderFixture]);

    renderHook(() => useAdminOrders('pending'));

    await waitFor(() => expect(getAllOrders).toHaveBeenCalledWith('pending'));
  });

  it('vuelve a consultar cuando cambia el filtro de estado', async () => {
    vi.mocked(getAllOrders).mockResolvedValue([]);

    const { rerender } = renderHook(({ status }) => useAdminOrders(status), {
      initialProps: { status: undefined as 'pending' | undefined },
    });

    await waitFor(() => expect(getAllOrders).toHaveBeenCalledTimes(1));

    rerender({ status: 'pending' });

    await waitFor(() => expect(getAllOrders).toHaveBeenCalledTimes(2));
    expect(getAllOrders).toHaveBeenLastCalledWith('pending');
  });

  it('pasa a error con un mensaje amigable si la consulta falla', async () => {
    vi.mocked(getAllOrders).mockRejectedValue(new Error('network-error'));

    const { result } = renderHook(() => useAdminOrders(undefined));

    await waitFor(() => {
      expect(result.current).toMatchObject({
        status: 'error',
        message: 'No pudimos cargar las órdenes. Intenta de nuevo.',
      });
    });
  });
});

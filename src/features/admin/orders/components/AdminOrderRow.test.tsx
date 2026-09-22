import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { AdminOrderRow } from '@/features/admin/orders/components/AdminOrderRow';
import { updateOrderStatus } from '@/features/admin/orders/services/updateOrderStatus';
import type { Order, OrderStatus } from '@shared/schemas/order';

vi.mock('@/features/admin/orders/services/updateOrderStatus', () => ({
  updateOrderStatus: vi.fn(),
}));

const fakeUser = {} as User;

function orderFixture(overrides: Partial<Order> = {}): Order {
  return {
    id: 'aaaa1111-bbbb-2222-cccc-333344445555',
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
    ...overrides,
  };
}

function renderRow(status: OrderStatus, onMutated = vi.fn()) {
  return {
    onMutated,
    ...render(
      <table>
        <tbody>
          <AdminOrderRow order={orderFixture({ status })} user={fakeUser} onMutated={onMutated} />
        </tbody>
      </table>,
    ),
  };
}

describe('AdminOrderRow', () => {
  it('en pending, ofrece "Marcar en proceso" y "Cancelar" (F11.3)', () => {
    renderRow('pending');

    expect(screen.getByRole('button', { name: 'Marcar en proceso' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Marcar completada' })).not.toBeInTheDocument();
  });

  it('en processing, ofrece "Marcar completada" y "Cancelar", no "Marcar en proceso" (F11.3)', () => {
    renderRow('processing');

    expect(screen.getByRole('button', { name: 'Marcar completada' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Marcar en proceso' })).not.toBeInTheDocument();
  });

  it.each(['completed', 'cancelled'] as const)(
    'en %s, no ofrece ninguna transicion (F11.4)',
    (status) => {
      renderRow(status);

      expect(screen.queryByRole('button', { name: 'Marcar en proceso' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Marcar completada' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    },
  );

  it('avanzar de estado llama al servicio con el estado destino y avisa al padre', async () => {
    vi.mocked(updateOrderStatus).mockResolvedValue({ ok: true });
    const { onMutated } = renderRow('pending');

    fireEvent.click(screen.getByRole('button', { name: 'Marcar en proceso' }));

    await waitFor(() => expect(onMutated).toHaveBeenCalledTimes(1));
    expect(updateOrderStatus).toHaveBeenCalledWith(
      fakeUser,
      'aaaa1111-bbbb-2222-cccc-333344445555',
      'processing',
    );
  });

  it('mientras la transicion esta en curso, deshabilita los botones de la fila', async () => {
    let resolvePromise: (value: { ok: true }) => void = () => {};
    vi.mocked(updateOrderStatus).mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );
    renderRow('pending');

    fireEvent.click(screen.getByRole('button', { name: 'Marcar en proceso' }));

    expect(screen.getByRole('button', { name: 'Marcar en proceso' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();

    resolvePromise({ ok: true });
    await waitFor(() => expect(updateOrderStatus).toHaveBeenCalledTimes(1));
  });

  it('cancelar abre el modal de confirmacion y, al confirmar, llama al servicio con "cancelled"', async () => {
    vi.mocked(updateOrderStatus).mockResolvedValue({ ok: true });
    const { onMutated } = renderRow('pending');

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cancelación' }));

    await waitFor(() => expect(onMutated).toHaveBeenCalledTimes(1));
    expect(updateOrderStatus).toHaveBeenCalledWith(
      fakeUser,
      'aaaa1111-bbbb-2222-cccc-333344445555',
      'cancelled',
    );
  });

  it('si el cambio de estado falla, muestra el error y vuelve a habilitar los botones', async () => {
    vi.mocked(updateOrderStatus).mockResolvedValue({
      ok: false,
      message: 'No pudimos cambiar el estado de la orden. Intenta de nuevo.',
    });
    const { onMutated } = renderRow('pending');

    fireEvent.click(screen.getByRole('button', { name: 'Marcar en proceso' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'No pudimos cambiar el estado de la orden. Intenta de nuevo.',
      );
    });
    expect(onMutated).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Marcar en proceso' })).not.toBeDisabled();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage';
import { useAuth } from '@/hooks/useAuth';
import { useOrder } from '@/features/orders/hooks/useOrder';
import type { AuthContextValue } from '@/contexts/AuthContext';
import type { Order, OrderStatus } from '@shared/schemas/order';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/orders/hooks/useOrder', () => ({ useOrder: vi.fn() }));
vi.mock('@/features/orders/components/CancelOrderModal', () => ({
  CancelOrderModal: ({
    onCancelled,
    onClose,
  }: {
    onCancelled: () => void;
    onClose: () => void;
  }) => (
    <div role="dialog">
      <button onClick={onCancelled}>mock-confirmar-cancelacion</button>
      <button onClick={onClose}>mock-volver</button>
    </div>
  ),
}));

const fakeUser = {} as User;

function orderFixture(status: OrderStatus = 'pending'): Order {
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
    status,
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
}

function renderOrderDetailPage() {
  const Stub = createRoutesStub([{ path: '/orders/:orderId', Component: OrderDetailPage }]);
  return render(<Stub initialEntries={['/orders/aaaa1111-bbbb-2222-cccc-333344445555']} />);
}

describe('OrderDetailPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: fakeUser,
      role: 'customer',
      logout: vi.fn(),
    } satisfies AuthContextValue);
  });

  it('orden no encontrada muestra el mensaje y un link de vuelta a mis ordenes (F7.2)', () => {
    vi.mocked(useOrder).mockReturnValue({ status: 'not-found', retry: vi.fn() });

    renderOrderDetailPage();

    expect(screen.getByText('Orden no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver mis órdenes' })).toHaveAttribute(
      'href',
      '/orders',
    );
  });

  it('si la consulta falla, muestra el error', () => {
    vi.mocked(useOrder).mockReturnValue({
      status: 'error',
      message: 'No pudimos cargar la orden. Intenta de nuevo.',
      retry: vi.fn(),
    });

    renderOrderDetailPage();

    expect(screen.getByText('No pudimos cargar la orden. Intenta de nuevo.')).toBeInTheDocument();
  });

  it('muestra items, totales y datos de envio de una orden encontrada (F7.3)', () => {
    vi.mocked(useOrder).mockReturnValue({
      status: 'success',
      order: orderFixture(),
      retry: vi.fn(),
    });

    renderOrderDetailPage();

    expect(screen.getByText('Teclado Aurora')).toBeInTheDocument();
    expect(screen.getByText('Hernán Albornoz')).toBeInTheDocument();
    expect(screen.getByText(/94.998/)).toBeInTheDocument();
  });

  it('una orden pendiente ofrece cancelar; confirmarla refresca la orden (F7.6, F7.7)', () => {
    const retry = vi.fn();
    vi.mocked(useOrder).mockReturnValue({
      status: 'success',
      order: orderFixture('pending'),
      retry,
    });

    renderOrderDetailPage();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar orden' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'mock-confirmar-cancelacion' }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['processing', 'completed', 'cancelled'] satisfies OrderStatus[])(
    'una orden en estado %s no ofrece la accion de cancelar (F7.8)',
    (status) => {
      vi.mocked(useOrder).mockReturnValue({
        status: 'success',
        order: orderFixture(status),
        retry: vi.fn(),
      });

      renderOrderDetailPage();

      expect(screen.queryByRole('button', { name: 'Cancelar orden' })).not.toBeInTheDocument();
    },
  );
});

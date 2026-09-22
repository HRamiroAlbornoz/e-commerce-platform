import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { OrdersPage } from '@/features/orders/pages/OrdersPage';
import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/features/orders/hooks/useOrders';
import type { AuthContextValue } from '@/contexts/AuthContext';
import type { Order } from '@shared/schemas/order';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/orders/hooks/useOrders', () => ({ useOrders: vi.fn() }));

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

function renderOrdersPage() {
  const Stub = createRoutesStub([{ path: '/orders', Component: OrdersPage }]);
  return render(<Stub initialEntries={['/orders']} />);
}

describe('OrdersPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: fakeUser,
      role: 'customer',
      logout: vi.fn(),
    } satisfies AuthContextValue);
  });

  it('sin ordenes, muestra el estado vacio (F7.4)', () => {
    vi.mocked(useOrders).mockReturnValue({ status: 'success', orders: [], retry: vi.fn() });

    renderOrdersPage();

    expect(screen.getByText('Todavía no hiciste ninguna compra')).toBeInTheDocument();
  });

  it('con ordenes, lista cada una con su numero y estado', () => {
    vi.mocked(useOrders).mockReturnValue({
      status: 'success',
      orders: [orderFixture()],
      retry: vi.fn(),
    });

    renderOrdersPage();

    expect(screen.getByText(/44445555/)).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('si la consulta falla, muestra el error con reintentar', () => {
    const retry = vi.fn();
    vi.mocked(useOrders).mockReturnValue({
      status: 'error',
      message: 'No pudimos cargar tus órdenes. Intenta de nuevo.',
      retry,
    });

    renderOrdersPage();

    expect(
      screen.getByText('No pudimos cargar tus órdenes. Intenta de nuevo.'),
    ).toBeInTheDocument();
  });
});

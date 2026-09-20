import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { AdminOrdersPage } from '@/features/admin/orders/pages/AdminOrdersPage';
import { useAuth } from '@/hooks/useAuth';
import { useAdminOrders } from '@/features/admin/orders/hooks/useAdminOrders';
import type { AuthContextValue } from '@/contexts/AuthContext';
import type { Order } from '@shared/schemas/order';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/admin/orders/hooks/useAdminOrders', () => ({ useAdminOrders: vi.fn() }));

const fakeUser = {} as User;

function orderFixture(overrides: Partial<Order> = {}): Order {
  return {
    id: 'aaaa1111-bbbb-2222-cccc-333344445555',
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
    ...overrides,
  };
}

function renderPage(initialEntry = '/admin/orders') {
  const Stub = createRoutesStub([{ path: '/admin/orders', Component: AdminOrdersPage }]);
  return render(<Stub initialEntries={[initialEntry]} />);
}

describe('AdminOrdersPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: fakeUser,
      role: 'admin',
      logout: vi.fn(),
    } satisfies AuthContextValue);
  });

  it('sin ordenes, muestra el estado vacio inicial', () => {
    vi.mocked(useAdminOrders).mockReturnValue({ status: 'success', orders: [], retry: vi.fn() });

    renderPage();

    expect(screen.getByText('Todavía no hay órdenes')).toBeInTheDocument();
  });

  it('con ordenes, lista cada una con numero, cliente y estado (F11.1)', () => {
    vi.mocked(useAdminOrders).mockReturnValue({
      status: 'success',
      orders: [orderFixture()],
      retry: vi.fn(),
    });

    renderPage();

    const table = within(screen.getByRole('table'));
    expect(table.getByText('#44445555')).toBeInTheDocument();
    expect(table.getByText('Hernán Albornoz')).toBeInTheDocument();
    expect(table.getByText('Pendiente')).toBeInTheDocument();
  });

  it('si la consulta falla, muestra el error con reintentar', () => {
    vi.mocked(useAdminOrders).mockReturnValue({
      status: 'error',
      message: 'No pudimos cargar las órdenes. Intenta de nuevo.',
      retry: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('No pudimos cargar las órdenes. Intenta de nuevo.')).toBeInTheDocument();
  });

  it('el filtro de estado activo queda en la URL (F11.2)', () => {
    const useAdminOrdersMock = vi.mocked(useAdminOrders);
    useAdminOrdersMock.mockReturnValue({
      status: 'success',
      orders: [orderFixture()],
      retry: vi.fn(),
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelada' }));

    expect(useAdminOrdersMock).toHaveBeenLastCalledWith('cancelled');
  });

  it('con ?status=processing en la URL, arranca filtrado por ese estado (F11.2)', () => {
    const useAdminOrdersMock = vi.mocked(useAdminOrders);
    useAdminOrdersMock.mockReturnValue({
      status: 'success',
      orders: [orderFixture({ status: 'processing' })],
      retry: vi.fn(),
    });

    renderPage('/admin/orders?status=processing');

    expect(useAdminOrdersMock).toHaveBeenCalledWith('processing');
  });

  it('un filtro sin resultados se lee distinto de "no hay ordenes"', () => {
    vi.mocked(useAdminOrders).mockReturnValue({ status: 'success', orders: [], retry: vi.fn() });

    renderPage('/admin/orders?status=completed');

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.queryByText('Todavía no hay órdenes')).not.toBeInTheDocument();
  });
});

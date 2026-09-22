import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { AdminProductsPage } from '@/features/admin/products/pages/AdminProductsPage';
import { useAuth } from '@/hooks/useAuth';
import { useAdminProducts } from '@/features/admin/products/hooks/useAdminProducts';
import type { AuthContextValue } from '@/contexts/AuthContext';
import type { Product } from '@shared/schemas/product';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/features/admin/products/hooks/useAdminProducts', () => ({ useAdminProducts: vi.fn() }));

const fakeUser = {} as User;

function productFixture(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    name: 'Teclado Aurora',
    nameLower: 'teclado aurora',
    description: 'Descripcion',
    price: 89999,
    stock: 40,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Switches', value: 'Lineales' }],
    curatorialNote: 'Nota',
    ratingAverage: 0,
    ratingCount: 0,
    orderCount: 0,
    unitsSold: 0,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

function renderPage() {
  const Stub = createRoutesStub([{ path: '/admin/products', Component: AdminProductsPage }]);
  return render(<Stub initialEntries={['/admin/products']} />);
}

describe('AdminProductsPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: fakeUser,
      role: 'admin',
      logout: vi.fn(),
    } satisfies AuthContextValue);
  });

  it('sin productos, muestra el estado vacio inicial (F9.9)', () => {
    vi.mocked(useAdminProducts).mockReturnValue({ status: 'success', data: [], retry: vi.fn() });

    renderPage();

    expect(screen.getByText('Todavía no hay productos')).toBeInTheDocument();
  });

  it('con productos, lista cada uno con nombre y categoria', () => {
    vi.mocked(useAdminProducts).mockReturnValue({
      status: 'success',
      data: [productFixture()],
      retry: vi.fn(),
    });

    renderPage();

    expect(screen.getAllByText('Teclado Aurora').length).toBeGreaterThan(0);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('un filtro sin resultados se lee distinto de "no hay productos" (F9.10)', () => {
    vi.mocked(useAdminProducts).mockReturnValue({
      status: 'success',
      data: [productFixture({ name: 'Teclado Aurora' })],
      retry: vi.fn(),
    });

    renderPage();

    fireEvent.change(screen.getByLabelText('Buscar productos por nombre'), {
      target: { value: 'mouse' },
    });

    expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    expect(screen.queryByText('Todavía no hay productos')).not.toBeInTheDocument();
  });

  it('si la consulta falla, muestra el error con reintentar', () => {
    vi.mocked(useAdminProducts).mockReturnValue({
      status: 'error',
      message: 'No pudimos cargar los productos. Intenta de nuevo.',
      retry: vi.fn(),
    });

    renderPage();

    expect(
      screen.getByText('No pudimos cargar los productos. Intenta de nuevo.'),
    ).toBeInTheDocument();
  });

  it('un producto retirado se muestra en la tabla, no desaparece (F9.6: sigue siendo reversible)', () => {
    vi.mocked(useAdminProducts).mockReturnValue({
      status: 'success',
      data: [productFixture({ isActive: false })],
      retry: vi.fn(),
    });

    renderPage();

    expect(screen.getAllByText('Teclado Aurora').length).toBeGreaterThan(0);
    expect(screen.getByText('Retirado')).toBeInTheDocument();
  });
});

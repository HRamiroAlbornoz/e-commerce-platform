import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import type { AuthContextValue, AuthState } from '@/contexts/AuthContext';
import { AdminRoute } from '@/routes/AdminRoute';
import { buildCartContextValue } from '@/test/mocks/cartContextValue';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('@/hooks/useCart', () => ({ useCart: vi.fn() }));

vi.mocked(useCart).mockReturnValue(buildCartContextValue());

// AdminRoute solo lee status/role: un User real de Firebase no aporta nada al test.
const fakeUser = {} as User;

function mockAuth(state: AuthState): void {
  const value: AuthContextValue = { ...state, logout: vi.fn() };
  vi.mocked(useAuth).mockReturnValue(value);
}

function AdminContent() {
  return <p>Panel de administracion</p>;
}

function LoginScreen() {
  return <p>Pantalla de login</p>;
}

function renderAdminRoute() {
  const Stub = createRoutesStub([
    {
      Component: AdminRoute,
      children: [{ path: '/admin', Component: AdminContent }],
    },
    { path: '/login', Component: LoginScreen },
  ]);
  return render(<Stub initialEntries={['/admin']} />);
}

describe('AdminRoute', () => {
  it('no decide nada mientras la autenticacion esta cargando', () => {
    mockAuth({ status: 'loading' });

    const { container } = renderAdminRoute();

    expect(container).toBeEmptyDOMElement();
  });

  it('redirige a login cuando no hay sesion', () => {
    mockAuth({ status: 'anonymous' });

    renderAdminRoute();

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('muestra una pantalla que explica el acceso restringido para un customer', () => {
    mockAuth({ status: 'authenticated', user: fakeUser, role: 'customer' });

    renderAdminRoute();

    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'CLACK', level: 1 })).toBeInTheDocument();
    expect(screen.queryByText('Panel de administracion')).not.toBeInTheDocument();
  });

  it('muestra el panel para un admin', () => {
    mockAuth({ status: 'authenticated', user: fakeUser, role: 'admin' });

    renderAdminRoute();

    expect(screen.getByText('Panel de administracion')).toBeInTheDocument();
  });
});

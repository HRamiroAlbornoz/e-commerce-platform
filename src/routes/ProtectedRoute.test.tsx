import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub, useLocation } from 'react-router';
import type { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import type { AuthContextValue, AuthState } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { getRedirectPath } from '@/routes/redirectState';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

// ProtectedRoute solo lee status/role: un User real de Firebase no aporta nada al test.
const fakeUser = {} as User;

function mockAuth(state: AuthState): void {
  const value: AuthContextValue = { ...state, logout: vi.fn() };
  vi.mocked(useAuth).mockReturnValue(value);
}

function PrivateContent() {
  return <p>Contenido privado</p>;
}

function LoginScreen() {
  const location = useLocation();
  const from = getRedirectPath(location.state);
  return <p>Pantalla de login (from: {from})</p>;
}

function renderProtectedRoute(initialPath: string) {
  const Stub = createRoutesStub([
    {
      Component: ProtectedRoute,
      children: [{ path: '/private/*', Component: PrivateContent }],
    },
    { path: '/login', Component: LoginScreen },
  ]);
  return render(<Stub initialEntries={[initialPath]} />);
}

describe('ProtectedRoute', () => {
  it('no decide nada mientras la autenticacion esta cargando', () => {
    mockAuth({ status: 'loading' });

    const { container } = renderProtectedRoute('/private/orders');

    expect(container).toBeEmptyDOMElement();
  });

  it('redirige a login cuando no hay sesion, conservando la ruta de origen', () => {
    mockAuth({ status: 'anonymous' });

    renderProtectedRoute('/private/orders');

    expect(screen.getByText('Pantalla de login (from: /private/orders)')).toBeInTheDocument();
  });

  it('muestra el contenido protegido cuando hay sesion', () => {
    mockAuth({ status: 'authenticated', user: fakeUser, role: 'customer' });

    renderProtectedRoute('/private/orders');

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});

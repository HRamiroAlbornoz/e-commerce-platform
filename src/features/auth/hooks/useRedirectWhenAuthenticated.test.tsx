import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import type { AuthContextValue, AuthState } from '@/contexts/AuthContext';
import { useRedirectWhenAuthenticated } from '@/features/auth/hooks/useRedirectWhenAuthenticated';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

// El hook solo lee status: un User real de Firebase no aporta nada al test.
const fakeUser = {} as User;

function mockAuth(state: AuthState): void {
  const value: AuthContextValue = { ...state, logout: vi.fn() };
  vi.mocked(useAuth).mockReturnValue(value);
}

function TestComponent({ to }: { to: string }) {
  useRedirectWhenAuthenticated(to);
  return <p>Formulario</p>;
}

function renderAt(to: string) {
  const Stub = createRoutesStub([
    { path: '/login', Component: () => <TestComponent to={to} /> },
    { path: '/account', Component: () => <p>Cuenta</p> },
  ]);
  return render(<Stub initialEntries={['/login']} />);
}

describe('useRedirectWhenAuthenticated', () => {
  it('no navega mientras la sesion esta cargando', () => {
    mockAuth({ status: 'loading' });
    renderAt('/account');
    expect(screen.getByText('Formulario')).toBeInTheDocument();
  });

  it('no navega cuando no hay sesion', () => {
    mockAuth({ status: 'anonymous' });
    renderAt('/account');
    expect(screen.getByText('Formulario')).toBeInTheDocument();
  });

  it('navega al destino indicado cuando la sesion se confirma', () => {
    mockAuth({ status: 'authenticated', user: fakeUser, role: 'customer' });

    renderAt('/account');

    expect(screen.getByText('Cuenta')).toBeInTheDocument();
  });
});

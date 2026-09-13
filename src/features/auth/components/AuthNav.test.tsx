import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import type { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import type { AuthContextValue, AuthState } from '@/contexts/AuthContext';
import { AuthNav } from '@/features/auth/components/AuthNav';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

// AuthNav solo lee status/role: un User real de Firebase no aporta nada al test.
const fakeUser = {} as User;

function mockAuth(state: AuthState, logout = vi.fn()): void {
  const value: AuthContextValue = { ...state, logout };
  vi.mocked(useAuth).mockReturnValue(value);
}

function renderAuthNav() {
  const Stub = createRoutesStub([
    { path: '/', Component: AuthNav },
    { path: '/login', Component: () => <p>Pantalla de login</p> },
  ]);
  return render(<Stub initialEntries={['/']} />);
}

describe('AuthNav', () => {
  it('no muestra nada mientras la autenticacion esta cargando', () => {
    mockAuth({ status: 'loading' });

    const { container } = renderAuthNav();

    expect(container).toBeEmptyDOMElement();
  });

  it('muestra un link a iniciar sesion cuando no hay sesion', () => {
    mockAuth({ status: 'anonymous' });

    renderAuthNav();

    expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '/login');
  });

  it('muestra mi cuenta y cerrar sesion cuando hay sesion, y cerrar sesion desconecta', async () => {
    const logout = vi.fn().mockResolvedValue(undefined);
    mockAuth({ status: 'authenticated', user: fakeUser, role: 'customer' }, logout);

    renderAuthNav();

    expect(screen.getByRole('link', { name: 'Mi cuenta' })).toHaveAttribute('href', '/account');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    await waitFor(() => expect(logout).toHaveBeenCalledOnce());
  });
});

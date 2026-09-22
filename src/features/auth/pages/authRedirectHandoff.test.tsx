import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRoutesStub, useLocation } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import type { AuthContextValue } from '@/contexts/AuthContext';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';

vi.mock('@/hooks/useAuth', () => ({ useAuth: vi.fn() }));

function mockAuth(value: AuthContextValue): void {
  vi.mocked(useAuth).mockReturnValue(value);
}

function LocationProbe() {
  const location = useLocation();
  return <p>Ruta actual: {location.pathname}</p>;
}

describe('handoff del destino de redirect entre login y registro', () => {
  it('el link "Crea una" desde login navega a registro sin perder el intento de checkout', () => {
    mockAuth({ status: 'anonymous', logout: vi.fn() });
    const Stub = createRoutesStub([
      { path: '/login', Component: LoginPage },
      { path: '/register', Component: RegisterPage },
    ]);

    render(<Stub initialEntries={[{ pathname: '/login', state: { from: '/checkout' } }]} />);
    fireEvent.click(screen.getByRole('link', { name: 'Crea una' }));

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('registrarse con un destino guardado en el state redirige ahi, no a la raiz', async () => {
    mockAuth({ status: 'authenticated', user: {} as never, role: 'customer', logout: vi.fn() });
    const Stub = createRoutesStub([
      { path: '/register', Component: RegisterPage },
      { path: '/checkout', Component: LocationProbe },
    ]);

    render(<Stub initialEntries={[{ pathname: '/register', state: { from: '/checkout' } }]} />);

    expect(await screen.findByText('Ruta actual: /checkout')).toBeInTheDocument();
  });

  it('registrarse sin ningun destino guardado redirige a la raiz', async () => {
    mockAuth({ status: 'authenticated', user: {} as never, role: 'customer', logout: vi.fn() });
    const Stub = createRoutesStub([
      { path: '/register', Component: RegisterPage },
      { path: '/', Component: LocationProbe },
    ]);

    render(<Stub initialEntries={['/register']} />);

    expect(await screen.findByText('Ruta actual: /')).toBeInTheDocument();
  });
});

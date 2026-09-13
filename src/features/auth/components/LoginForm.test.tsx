import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { loginWithEmail } from '@/features/auth/services/loginWithEmail';

vi.mock('@/features/auth/services/loginWithEmail', () => ({
  loginWithEmail: vi.fn(),
}));

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@clack.com' } });
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '12345678' } });
  fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(loginWithEmail).mockReset();
  });

  it('deja el formulario deshabilitado tras un login exitoso, a la espera de que la sesion se confirme', async () => {
    vi.mocked(loginWithEmail).mockResolvedValue({ ok: true });

    render(<LoginForm onForgotPassword={vi.fn()} />);
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });
    fillAndSubmit();

    await waitFor(() => expect(submitButton).toBeDisabled());
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  it('muestra el mensaje generico cuando el login falla', async () => {
    vi.mocked(loginWithEmail).mockResolvedValue({
      ok: false,
      message: 'El email o la contraseña son incorrectos.',
    });

    render(<LoginForm onForgotPassword={vi.fn()} />);
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByText('El email o la contraseña son incorrectos.')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).not.toBeDisabled();
  });

  it('el link de olvidaste tu contraseña dispara el callback', () => {
    const onForgotPassword = vi.fn();
    render(<LoginForm onForgotPassword={onForgotPassword} />);

    fireEvent.click(screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' }));

    expect(onForgotPassword).toHaveBeenCalledOnce();
  });
});

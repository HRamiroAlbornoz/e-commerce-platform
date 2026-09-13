import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { requestPasswordReset } from '@/features/auth/services/requestPasswordReset';

vi.mock('@/features/auth/services/requestPasswordReset', () => ({
  requestPasswordReset: vi.fn(),
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.mocked(requestPasswordReset).mockReset();
  });

  it('confirma el envio del correo', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({ ok: true });

    render(<ForgotPasswordForm onBackToLogin={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@clack.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    await waitFor(() => {
      expect(
        screen.getByText(/te enviamos un correo para restablecer la contraseña/i),
      ).toBeInTheDocument();
    });
  });

  it('muestra un error real cuando el envio falla por conexion', async () => {
    vi.mocked(requestPasswordReset).mockResolvedValue({
      ok: false,
      message: 'No pudimos enviar el correo. Intentá de nuevo.',
    });

    render(<ForgotPasswordForm onBackToLogin={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@clack.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    await waitFor(() => {
      expect(screen.getByText('No pudimos enviar el correo. Intentá de nuevo.')).toBeInTheDocument();
    });
  });

  it('el link de volver a iniciar sesion dispara el callback', () => {
    const onBackToLogin = vi.fn();
    render(<ForgotPasswordForm onBackToLogin={onBackToLogin} />);

    fireEvent.click(screen.getByRole('button', { name: 'Volver a iniciar sesión' }));

    expect(onBackToLogin).toHaveBeenCalledOnce();
  });
});

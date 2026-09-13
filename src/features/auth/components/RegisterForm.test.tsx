import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { registerWithEmail } from '@/features/auth/services/registerWithEmail';

vi.mock('@/features/auth/services/registerWithEmail', () => ({
  registerWithEmail: vi.fn(),
}));

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.mocked(registerWithEmail).mockReset();
  });

  it('deshabilita crear cuenta con una contraseña de menos de 8 caracteres y explica el requisito', () => {
    render(<RegisterForm />);

    expect(screen.getByText('Mínimo 8 caracteres.')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '1234567' } });

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDisabled();
  });

  it('habilita crear cuenta cuando la contraseña alcanza el minimo', () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '12345678' } });

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).not.toBeDisabled();
  });

  it('muestra el error de email ya registrado en el campo, sin perder lo tipeado en el resto', async () => {
    vi.mocked(registerWithEmail).mockResolvedValue({
      ok: false,
      field: 'email',
      message: 'Ya existe una cuenta con este email.',
    });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@clack.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Ya existe una cuenta con este email.')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Nombre')).toHaveValue('Ana');
    expect(screen.getByLabelText('Contraseña')).toHaveValue('12345678');
  });

  it('deja el formulario deshabilitado tras crear la cuenta, a la espera de que la sesion se confirme', async () => {
    vi.mocked(registerWithEmail).mockResolvedValue({ ok: true });

    render(<RegisterForm />);
    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' });

    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'ana@clack.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: '12345678' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(submitButton).toBeDisabled());
    expect(screen.getByLabelText('Nombre')).toBeDisabled();
  });
});

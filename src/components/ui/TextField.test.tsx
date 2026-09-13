import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextField } from '@/components/ui/TextField';

describe('TextField', () => {
  it('asocia el hint al input via aria-describedby cuando no hay error', () => {
    render(<TextField label="Contraseña" hint="Mínimo 8 caracteres." />);

    const input = screen.getByLabelText('Contraseña');
    const hint = screen.getByText('Mínimo 8 caracteres.');

    expect(input).toHaveAttribute('aria-describedby', hint.id);
  });

  it('asocia el error al input y oculta el hint cuando hay un error', () => {
    render(<TextField label="Contraseña" hint="Mínimo 8 caracteres." error="Contraseña invalida." />);

    const input = screen.getByLabelText('Contraseña');
    const error = screen.getByText('Contraseña invalida.');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
    expect(screen.queryByText('Mínimo 8 caracteres.')).not.toBeInTheDocument();
  });

  it('no agrega aria-describedby cuando no hay hint ni error', () => {
    render(<TextField label="Nombre" />);

    expect(screen.getByLabelText('Nombre')).not.toHaveAttribute('aria-describedby');
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from '@/components/ui/Textarea';

describe('Textarea', () => {
  it('asocia el hint al textarea via aria-describedby cuando no hay error', () => {
    render(<Textarea label="Comentario" hint="Máximo 500 caracteres." />);

    const textarea = screen.getByLabelText('Comentario');
    const hint = screen.getByText('Máximo 500 caracteres.');

    expect(textarea).toHaveAttribute('aria-describedby', hint.id);
  });

  it('asocia el error al textarea y oculta el hint cuando hay un error', () => {
    render(
      <Textarea
        label="Comentario"
        hint="Máximo 500 caracteres."
        error="El comentario es obligatorio."
      />,
    );

    const textarea = screen.getByLabelText('Comentario');
    const error = screen.getByText('El comentario es obligatorio.');

    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea).toHaveAttribute('aria-describedby', error.id);
    expect(screen.queryByText('Máximo 500 caracteres.')).not.toBeInTheDocument();
  });

  it('no agrega aria-describedby cuando no hay hint ni error', () => {
    render(<Textarea label="Comentario" />);

    expect(screen.getByLabelText('Comentario')).not.toHaveAttribute('aria-describedby');
  });
});

import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingDisplay } from '@/features/reviews/components/RatingDisplay';

describe('RatingDisplay', () => {
  it('siempre muestra la calificación en texto, no solo con un indicador visual', () => {
    render(<RatingDisplay rating={4} />);

    expect(screen.getByText('4/5')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Calificación: 4 de 5' })).toBeInTheDocument();
  });

  it('distingue cada calificación con una etiqueta accesible distinta', () => {
    const { unmount } = render(<RatingDisplay rating={1} />);
    expect(screen.getByRole('img', { name: 'Calificación: 1 de 5' })).toBeInTheDocument();
    unmount();

    render(<RatingDisplay rating={5} />);
    expect(screen.getByRole('img', { name: 'Calificación: 5 de 5' })).toBeInTheDocument();
  });
});

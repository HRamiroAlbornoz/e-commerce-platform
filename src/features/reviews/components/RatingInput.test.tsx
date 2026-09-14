import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useForm, useWatch, type Control } from 'react-hook-form';
import { RatingInput } from '@/features/reviews/components/RatingInput';
import type { ReviewInput } from '@shared/schemas/review';

function RatingValue({ control }: { control: Control<ReviewInput> }) {
  const rating = useWatch({ control, name: 'rating' });
  return <p data-testid="rating-value">{rating ?? 'sin-elegir'}</p>;
}

function Wrapper({ defaultRating }: { defaultRating?: number }) {
  const { control } = useForm<ReviewInput>(
    defaultRating ? { defaultValues: { rating: defaultRating } } : {},
  );

  return (
    <div>
      <RatingInput control={control} />
      <RatingValue control={control} />
    </div>
  );
}

describe('RatingInput', () => {
  it('renderiza las cinco opciones de calificacion como un radiogroup accesible', () => {
    render(<Wrapper />);

    expect(screen.getByRole('radiogroup', { name: 'Calificación' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(5);
  });

  it('permite elegir una calificacion, y solo una a la vez', () => {
    render(<Wrapper />);

    fireEvent.click(screen.getByRole('radio', { name: '4' }));
    expect(screen.getByTestId('rating-value')).toHaveTextContent('4');

    fireEvent.click(screen.getByRole('radio', { name: '2' }));
    expect(screen.getByTestId('rating-value')).toHaveTextContent('2');
    expect(screen.getByRole('radio', { name: '4' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: '2' })).toBeChecked();
  });

  it('con un valor por defecto numerico, precarga la opcion correspondiente marcada', () => {
    render(<Wrapper defaultRating={3} />);

    expect(screen.getByRole('radio', { name: '3' })).toBeChecked();
    expect(screen.getByTestId('rating-value')).toHaveTextContent('3');
  });
});

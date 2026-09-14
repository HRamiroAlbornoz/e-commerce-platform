import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { ReviewForm } from '@/features/reviews/components/ReviewForm';
import { saveReview } from '@/features/reviews/services/saveReview';
import type { Review } from '@shared/schemas/review';

vi.mock('@/features/reviews/services/saveReview', () => ({ saveReview: vi.fn() }));

const fakeUser = { uid: 'user-1' } as User;

const existingReviewFixture: Review = {
  userId: 'user-1',
  displayName: 'Hernán Albornoz',
  rating: 3,
  comment: 'Cumple lo esperado.',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('ReviewForm', () => {
  it('sin reseña previa, arranca en blanco y ofrece "Publicar reseña"', () => {
    render(
      <ReviewForm productId="product-1" user={fakeUser} existingReview={null} onSaved={vi.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Publicar reseña' })).toBeInTheDocument();
    expect(screen.getByLabelText('Comentario')).toHaveValue('');
    screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toBeChecked());
  });

  it('con una reseña previa, precarga el rating y el comentario, y ofrece "Actualizar reseña"', () => {
    render(
      <ReviewForm
        productId="product-1"
        user={fakeUser}
        existingReview={existingReviewFixture}
        onSaved={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Actualizar reseña' })).toBeInTheDocument();
    expect(screen.getByLabelText('Comentario')).toHaveValue('Cumple lo esperado.');
    expect(screen.getByRole('radio', { name: '3' })).toBeChecked();
  });

  it('sin elegir calificación, no envía y muestra un error de validación', async () => {
    render(
      <ReviewForm productId="product-1" user={fakeUser} existingReview={null} onSaved={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText('Comentario'), { target: { value: 'Buen producto.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));

    await waitFor(() => expect(screen.getAllByRole('alert').length).toBeGreaterThan(0));
    expect(saveReview).not.toHaveBeenCalled();
  });

  it('al guardar con éxito, llama a saveReview y avisa al padre', async () => {
    vi.mocked(saveReview).mockResolvedValue(undefined);
    const onSaved = vi.fn();
    render(
      <ReviewForm productId="product-1" user={fakeUser} existingReview={null} onSaved={onSaved} />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '5' }));
    fireEvent.change(screen.getByLabelText('Comentario'), { target: { value: 'Excelente producto.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(saveReview).toHaveBeenCalledWith(
      fakeUser,
      'product-1',
      { rating: 5, comment: 'Excelente producto.' },
      undefined,
    );
  });

  it('al editar, conserva el createdAt original en el llamado a saveReview', async () => {
    vi.mocked(saveReview).mockResolvedValue(undefined);
    render(
      <ReviewForm
        productId="product-1"
        user={fakeUser}
        existingReview={existingReviewFixture}
        onSaved={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actualizar reseña' }));

    await waitFor(() =>
      expect(saveReview).toHaveBeenCalledWith(
        fakeUser,
        'product-1',
        { rating: 3, comment: 'Cumple lo esperado.' },
        existingReviewFixture.createdAt,
      ),
    );
  });

  it('si el guardado falla, muestra el motivo sin perder lo escrito', async () => {
    vi.mocked(saveReview).mockRejectedValue(new Error('network-error'));
    const onSaved = vi.fn();
    render(
      <ReviewForm productId="product-1" user={fakeUser} existingReview={null} onSaved={onSaved} />,
    );

    fireEvent.click(screen.getByRole('radio', { name: '5' }));
    fireEvent.change(screen.getByLabelText('Comentario'), { target: { value: 'Excelente producto.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar reseña' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No pudimos guardar tu reseña. Intentá de nuevo.');
    });
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Comentario')).toHaveValue('Excelente producto.');
  });
});

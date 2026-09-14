import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { DeleteReviewModal } from '@/features/reviews/components/DeleteReviewModal';
import { deleteReview } from '@/features/reviews/services/deleteReview';

vi.mock('@/features/reviews/services/deleteReview', () => ({ deleteReview: vi.fn() }));

const fakeUser = { uid: 'user-1' } as User;

function renderModal(onDeleted = vi.fn(), onClose = vi.fn()) {
  return {
    onDeleted,
    onClose,
    ...render(
      <DeleteReviewModal
        productId="product-1"
        productName="Teclado Aurora"
        user={fakeUser}
        onClose={onClose}
        onDeleted={onDeleted}
      />,
    ),
  };
}

describe('DeleteReviewModal', () => {
  it('nombra el producto en el titulo', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: /Teclado Aurora/ })).toBeInTheDocument();
  });

  it('el foco inicial va al boton seguro "Volver", no al destructivo', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Volver' })).toHaveFocus();
  });

  it('"Volver" cierra el modal sin llamar al servidor', () => {
    const { onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(deleteReview).not.toHaveBeenCalled();
  });

  it('confirmar borra la reseña y avisa al padre', async () => {
    vi.mocked(deleteReview).mockResolvedValue(undefined);
    const { onDeleted } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Borrar reseña' }));

    await waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
    expect(deleteReview).toHaveBeenCalledWith('product-1', 'user-1');
  });

  it('si el borrado falla, muestra el motivo sin cerrar el modal', async () => {
    vi.mocked(deleteReview).mockRejectedValue(new Error('network-error'));
    const { onDeleted } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Borrar reseña' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('No pudimos borrar tu reseña. Intentá de nuevo.');
    });
    expect(onDeleted).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

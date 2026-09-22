import type { User } from 'firebase/auth';
import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal';
import { deleteReview } from '@/features/reviews/services/deleteReview';

type DeleteReviewModalProps = {
  productId: string;
  productName: string;
  user: User;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteReviewModal({
  productId,
  productName,
  user,
  onClose,
  onDeleted,
}: DeleteReviewModalProps) {
  async function handleConfirm(): Promise<void> {
    try {
      await deleteReview(productId, user.uid);
    } catch {
      throw new Error('No pudimos borrar tu reseña. Intenta de nuevo.');
    }
  }

  return (
    <ConfirmActionModal
      title={`Borrar tu reseña de "${productName}"`}
      body="Esta acción no se puede deshacer."
      confirmLabel="Borrar reseña"
      loadingLabel="Borrando…"
      onConfirm={handleConfirm}
      onClose={onClose}
      onConfirmed={onDeleted}
    />
  );
}

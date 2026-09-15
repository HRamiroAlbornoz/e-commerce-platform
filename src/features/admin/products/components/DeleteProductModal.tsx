import type { User } from 'firebase/auth';
import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal';
import { deleteProduct } from '@/features/admin/products/services/deleteProduct';
import type { Product } from '@shared/schemas/product';

type DeleteProductModalProps = {
  product: Product;
  user: User;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteProductModal({ product, user, onClose, onDeleted }: DeleteProductModalProps) {
  async function handleConfirm(): Promise<void> {
    const result = await deleteProduct(user, product.id);
    if (!result.ok) {
      throw new Error(result.message);
    }
  }

  return (
    <ConfirmActionModal
      title={`Eliminar "${product.name}" definitivamente`}
      body="Esta acción no se puede deshacer. El producto va a desaparecer por completo del catálogo."
      confirmLabel="Eliminar definitivamente"
      loadingLabel="Eliminando…"
      onConfirm={handleConfirm}
      onClose={onClose}
      onConfirmed={onDeleted}
    />
  );
}

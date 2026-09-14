import type { User } from 'firebase/auth';
import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal';
import { cancelOrder } from '@/features/orders/services/cancelOrder';
import { formatOrderNumber } from '@/features/orders/utils/formatOrderNumber';
import type { Order } from '@shared/schemas/order';

type CancelOrderModalProps = {
  order: Order;
  user: User;
  onClose: () => void;
  onCancelled: () => void;
};

export function CancelOrderModal({ order, user, onClose, onCancelled }: CancelOrderModalProps) {
  async function handleConfirm(): Promise<void> {
    const result = await cancelOrder(user, order.id);
    if (!result.ok) {
      throw new Error(result.message);
    }
  }

  return (
    <ConfirmActionModal
      title={`Cancelar orden #${formatOrderNumber(order.id)}`}
      body="Esta acción no se puede deshacer. El stock de cada producto de esta orden vuelve a sumarse."
      confirmLabel="Confirmar cancelación"
      loadingLabel="Cancelando…"
      onConfirm={handleConfirm}
      onClose={onClose}
      onConfirmed={onCancelled}
    />
  );
}

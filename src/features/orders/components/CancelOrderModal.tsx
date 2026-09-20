import { ConfirmActionModal } from '@/components/ui/ConfirmActionModal';
import { formatOrderNumber } from '@/features/orders/utils/formatOrderNumber';
import type { Order } from '@shared/schemas/order';

type CancelOrderResult = { ok: true } | { ok: false; message: string };

type CancelOrderModalProps = {
  order: Order;
  onCancel: () => Promise<CancelOrderResult>;
  onClose: () => void;
  onCancelled: () => void;
};

export function CancelOrderModal({ order, onCancel, onClose, onCancelled }: CancelOrderModalProps) {
  async function handleConfirm(): Promise<void> {
    const result = await onCancel();
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

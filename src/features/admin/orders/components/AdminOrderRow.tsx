import { useState } from 'react';
import type { User } from 'firebase/auth';
import { DestructiveTriggerButton, TEXT_ACTION_BUTTON_CLASSES } from '@/components/ui/DestructiveTriggerButton';
import { InlineError } from '@/components/ui/InlineError';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { CancelOrderModal } from '@/features/orders/components/CancelOrderModal';
import { updateOrderStatus } from '@/features/admin/orders/services/updateOrderStatus';
import { formatOrderNumber } from '@/features/orders/utils/formatOrderNumber';
import { formatPrice } from '@/features/products/utils/formatPrice';
import { formatDate } from '@/lib/formatDate';
import { TABLE_LABEL_CLASSES } from '@/features/admin/constants/tableLabelClasses';
import { ORDER_STATUS_TRANSITIONS, type Order, type OrderStatus } from '@shared/schemas/order';

const FORWARD_TRANSITION_LABELS: Partial<Record<OrderStatus, string>> = {
  processing: 'Marcar en proceso',
  completed: 'Marcar completada',
};

type AdminOrderRowProps = {
  order: Order;
  user: User;
  onMutated: () => void;
};

export function AdminOrderRow({ order, user, onMutated }: AdminOrderRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const validTransitions = ORDER_STATUS_TRANSITIONS[order.status];
  const forwardTransitions = validTransitions.filter((next) => next !== 'cancelled');
  const canCancel = validTransitions.includes('cancelled');

  async function handleTransition(nextStatus: OrderStatus): Promise<void> {
    setIsUpdating(true);
    setUpdateError(null);

    const result = await updateOrderStatus(user, order.id, nextStatus);
    if (!result.ok) {
      setUpdateError(result.message);
      setIsUpdating(false);
      return;
    }

    onMutated();
  }

  return (
    <tr className="flex flex-col gap-2 border-b border-ink/10 py-4 md:table-row md:gap-0 md:py-0 dark:border-bone/10">
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>N.º</span>
        <span className="font-body text-sm font-medium text-ink dark:text-bone">
          #{formatOrderNumber(order.id)}
        </span>
      </td>
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>Fecha</span>
        <span className="font-body text-sm text-ink/70 dark:text-bone/70">
          {formatDate(order.createdAt)}
        </span>
      </td>
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>Cliente</span>
        <span className="font-body text-sm text-ink/70 dark:text-bone/70">
          {order.shipping.fullName}
        </span>
      </td>
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>Total</span>
        <span className="font-body text-sm tabular-nums text-ink dark:text-bone">
          {formatPrice(order.total)}
        </span>
      </td>
      <td className="flex items-center justify-between gap-2 md:table-cell md:py-3 md:pr-4">
        <span className={`${TABLE_LABEL_CLASSES} md:hidden`}>Estado</span>
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="md:py-3">
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap justify-end gap-3">
            {forwardTransitions.map((nextStatus) => (
              <button
                key={nextStatus}
                type="button"
                onClick={() => void handleTransition(nextStatus)}
                disabled={isUpdating}
                className={TEXT_ACTION_BUTTON_CLASSES}
              >
                {FORWARD_TRANSITION_LABELS[nextStatus]}
              </button>
            ))}
            {canCancel ? (
              <DestructiveTriggerButton
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isUpdating}
              >
                Cancelar
              </DestructiveTriggerButton>
            ) : null}
          </div>
          <InlineError message={updateError} />
        </div>

        {isCancelModalOpen ? (
          <CancelOrderModal
            order={order}
            onCancel={() => updateOrderStatus(user, order.id, 'cancelled')}
            onClose={() => setIsCancelModalOpen(false)}
            onCancelled={() => {
              setIsCancelModalOpen(false);
              onMutated();
            }}
          />
        ) : null}
      </td>
    </tr>
  );
}

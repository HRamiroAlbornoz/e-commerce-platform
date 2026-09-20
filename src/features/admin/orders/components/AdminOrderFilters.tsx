import { ORDER_STATUSES, type OrderStatus } from '@shared/schemas/order';
import { ORDER_STATUS_LABELS } from '@/features/orders/components/OrderStatusBadge';
import { FILTER_CHIP_CLASSES } from '@/features/products/constants/filterStyles';

type AdminOrderFiltersProps = {
  status: OrderStatus | undefined;
  onStatusChange: (status: OrderStatus | undefined) => void;
};

export function AdminOrderFilters({ status, onStatusChange }: AdminOrderFiltersProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por estado"
      className="mb-6 flex gap-5 overflow-x-auto border-b border-ink/15 pb-4 dark:border-bone/15"
    >
      <button
        type="button"
        aria-pressed={status === undefined}
        onClick={() => onStatusChange(undefined)}
        className={FILTER_CHIP_CLASSES}
      >
        Todas
      </button>
      {ORDER_STATUSES.map((orderStatus) => (
        <button
          key={orderStatus}
          type="button"
          aria-pressed={status === orderStatus}
          onClick={() => onStatusChange(orderStatus)}
          className={FILTER_CHIP_CLASSES}
        >
          {ORDER_STATUS_LABELS[orderStatus]}
        </button>
      ))}
    </div>
  );
}

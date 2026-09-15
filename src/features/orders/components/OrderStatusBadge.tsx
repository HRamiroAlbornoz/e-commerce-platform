import type { OrderStatus } from '@shared/schemas/order';
import { STATUS_BADGE_BASE_CLASSES } from '@/components/ui/statusBadgeClasses';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const OUTLINED_CLASSES = `${STATUS_BADGE_BASE_CLASSES} border border-current`;

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: OUTLINED_CLASSES,
  processing: `${OUTLINED_CLASSES} underline underline-offset-4`,
  completed: `${STATUS_BADGE_BASE_CLASSES} bg-ink text-bone dark:bg-bone dark:text-ink`,
  cancelled: `${OUTLINED_CLASSES} line-through`,
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <span className={STATUS_CLASSES[status]}>{STATUS_LABELS[status]}</span>;
}

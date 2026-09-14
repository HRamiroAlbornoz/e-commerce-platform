import type { OrderStatus } from '@shared/schemas/order';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const BASE_CLASSES = 'font-body inline-block px-2 py-0.5 text-xs font-medium tracking-widest uppercase';
const OUTLINED_CLASSES = `${BASE_CLASSES} border border-current`;

const STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: OUTLINED_CLASSES,
  processing: `${OUTLINED_CLASSES} underline underline-offset-4`,
  completed: `${BASE_CLASSES} bg-ink text-bone dark:bg-bone dark:text-ink`,
  cancelled: `${OUTLINED_CLASSES} line-through`,
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return <span className={STATUS_CLASSES[status]}>{STATUS_LABELS[status]}</span>;
}

import { Link } from 'react-router';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { formatOrderNumber } from '@/features/orders/utils/formatOrderNumber';
import { formatDate } from '@/lib/formatDate';
import { formatPrice } from '@/features/products/utils/formatPrice';
import type { Order } from '@shared/schemas/order';

type OrderListItemProps = {
  order: Order;
};

export function OrderListItem({ order }: OrderListItemProps) {
  return (
    <li>
      <Link
        to={`/orders/${order.id}`}
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-field-magenta dark:focus-visible:outline-field-cyan"
      >
        <div className="flex flex-col gap-1">
          <p className="font-display text-lg text-ink dark:text-bone">
            Orden #{formatOrderNumber(order.id)}
          </p>
          <p className="font-body text-xs text-ink/70 dark:text-bone/70">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <OrderStatusBadge status={order.status} />
          <p className="font-display w-24 text-right text-base tabular-nums text-ink dark:text-bone">
            {formatPrice(order.total)}
          </p>
        </div>
      </Link>
    </li>
  );
}

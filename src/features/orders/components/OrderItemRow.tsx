import { roundToCents, type OrderItem } from '@shared/schemas/order';
import { formatPrice } from '@/features/products/utils/formatPrice';

type OrderItemRowProps = {
  item: OrderItem;
};

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-6">
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg text-ink dark:text-bone">{item.name}</p>
        <p className="font-body text-xs text-ink/70 dark:text-bone/70">
          {item.quantity} × {formatPrice(item.unitPrice)}
        </p>
      </div>

      <p className="font-display w-24 text-right text-base tabular-nums text-ink dark:text-bone">
        {formatPrice(roundToCents(item.unitPrice * item.quantity))}
      </p>
    </li>
  );
}

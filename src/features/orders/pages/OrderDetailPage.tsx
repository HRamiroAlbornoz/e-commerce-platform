import { useState } from 'react';
import { Link, useParams } from 'react-router';
import type { User } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { useOrder } from '@/features/orders/hooks/useOrder';
import { OrderStatusBadge } from '@/features/orders/components/OrderStatusBadge';
import { OrderDetailSkeleton } from '@/features/orders/components/OrderDetailSkeleton';
import { OrderItemRow } from '@/features/orders/components/OrderItemRow';
import { CancelOrderModal } from '@/features/orders/components/CancelOrderModal';
import { formatOrderNumber } from '@/features/orders/utils/formatOrderNumber';
import { formatPrice } from '@/features/products/utils/formatPrice';
import { DestructiveTriggerButton } from '@/components/ui/DestructiveTriggerButton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import type { Order } from '@shared/schemas/order';

type OrderDetailContentProps = {
  order: Order;
  user: User;
  onCancelled: () => void;
};

function OrderDetailContent({ order, user, onCancelled }: OrderDetailContentProps) {
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl text-ink dark:text-bone">
          Orden #{formatOrderNumber(order.id)}
        </h2>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="border-t border-ink/15 pt-8 dark:border-bone/15">
        <ul className="divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
          {order.items.map((item) => (
            <OrderItemRow key={item.productId} item={item} />
          ))}
        </ul>

        <dl className="mt-2 flex flex-col gap-2 border-t border-ink/15 pt-6 dark:border-bone/15">
          <div className="flex items-center justify-between">
            <dt className="font-body text-xs tracking-widest text-ink/70 uppercase dark:text-bone/70">
              Subtotal
            </dt>
            <dd className="font-body text-sm tabular-nums text-ink dark:text-bone">
              {formatPrice(order.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-body text-xs tracking-widest text-ink/70 uppercase dark:text-bone/70">
              Envío
            </dt>
            <dd className="font-body text-sm tabular-nums text-ink dark:text-bone">
              {formatPrice(order.shippingCost)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-body text-xs font-medium tracking-widest text-ink/70 uppercase dark:text-bone/70">
              Total
            </dt>
            <dd className="font-display text-2xl tabular-nums text-ink dark:text-bone">
              {formatPrice(order.total)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-1 border-t border-ink/15 pt-8 dark:border-bone/15">
        <h3 className="font-display text-lg text-ink dark:text-bone">Envío</h3>
        <p className="font-body text-sm text-ink/80 dark:text-bone/80">{order.shipping.fullName}</p>
        <p className="font-body text-sm text-ink/80 dark:text-bone/80">
          {order.shipping.address}, {order.shipping.city}, {order.shipping.postalCode}
        </p>
        <p className="font-body text-sm text-ink/80 dark:text-bone/80">{order.shipping.phone}</p>
      </div>

      {order.status === 'pending' ? (
        <div className="flex justify-end">
          <DestructiveTriggerButton onClick={() => setIsCancelModalOpen(true)}>
            Cancelar orden
          </DestructiveTriggerButton>
        </div>
      ) : null}

      {isCancelModalOpen ? (
        <CancelOrderModal
          order={order}
          user={user}
          onClose={() => setIsCancelModalOpen(false)}
          onCancelled={() => {
            setIsCancelModalOpen(false);
            onCancelled();
          }}
        />
      ) : null}
    </>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const auth = useAuth();
  const detail = useOrder(orderId);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 md:px-8 md:py-16">
      {detail.status === 'loading' ? <OrderDetailSkeleton /> : null}

      {detail.status === 'not-found' ? (
        <>
          <EmptyState
            title="Orden no encontrada"
            description="Esta orden no existe o no pertenece a tu cuenta."
          />
          <div className="flex justify-center">
            <Link
              to="/orders"
              className="font-body border-b-2 border-ink text-sm font-medium tracking-wide text-ink uppercase hover:border-field-magenta hover:text-field-magenta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-magenta dark:border-bone dark:text-bone dark:hover:border-field-cyan dark:hover:text-field-cyan dark:focus-visible:outline-field-cyan"
            >
              Ver mis órdenes
            </Link>
          </div>
        </>
      ) : null}

      {detail.status === 'error' ? <ErrorState message={detail.message} onRetry={detail.retry} /> : null}

      {detail.status === 'success' && auth.status === 'authenticated' ? (
        <OrderDetailContent order={detail.order} user={auth.user} onCancelled={detail.retry} />
      ) : null}
    </main>
  );
}

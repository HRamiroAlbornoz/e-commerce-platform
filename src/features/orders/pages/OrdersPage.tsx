import { useAuth } from '@/hooks/useAuth';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { OrderListItem } from '@/features/orders/components/OrderListItem';
import { OrdersSkeleton } from '@/features/orders/components/OrdersSkeleton';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

export function OrdersPage() {
  const auth = useAuth();
  const uid = auth.status === 'authenticated' ? auth.user.uid : '';
  const orders = useOrders(uid);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 md:px-8 md:py-16">
      <h2 className="font-display text-3xl text-ink dark:text-bone">Mis órdenes</h2>

      <div className="border-t border-ink/15 pt-8 dark:border-bone/15">
        {orders.status === 'loading' ? <OrdersSkeleton /> : null}

        {orders.status === 'error' ? (
          <ErrorState message={orders.message} onRetry={orders.retry} />
        ) : null}

        {orders.status === 'success' && orders.orders.length === 0 ? (
          <EmptyState
            title="Todavía no hiciste ninguna compra"
            description="Cuando confirmes una compra, la vas a ver acá."
          />
        ) : null}

        {orders.status === 'success' && orders.orders.length > 0 ? (
          <ul className="divide-y divide-dotted divide-ink/30 dark:divide-bone/30">
            {orders.orders.map((order) => (
              <OrderListItem key={order.id} order={order} />
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}

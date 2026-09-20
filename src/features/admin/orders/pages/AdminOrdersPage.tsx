import { useSearchParams } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
import { useAdminOrders } from '@/features/admin/orders/hooks/useAdminOrders';
import { AdminOrderFilters } from '@/features/admin/orders/components/AdminOrderFilters';
import { AdminOrderRow } from '@/features/admin/orders/components/AdminOrderRow';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { parseOrderStatusParam } from '@/features/admin/orders/utils/parseOrderStatusParam';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';
import { TABLE_LABEL_CLASSES } from '@/features/admin/constants/tableLabelClasses';
import type { OrderStatus } from '@shared/schemas/order';

export function AdminOrdersPage() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseOrderStatusParam(searchParams.get('status'));
  const ordersState = useAdminOrders(status);

  function handleStatusChange(nextStatus: OrderStatus | undefined): void {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (nextStatus) {
        nextParams.set('status', nextStatus);
      } else {
        nextParams.delete('status');
      }
      return nextParams;
    });
  }

  if (auth.status !== 'authenticated') {
    return null;
  }

  const orders = ordersState.status === 'success' ? ordersState.orders : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-ink dark:text-bone">Órdenes</h1>
      </div>

      {(orders && orders.length > 0) || status !== undefined ? (
        <AdminOrderFilters status={status} onStatusChange={handleStatusChange} />
      ) : null}

      {ordersState.status === 'loading' ? <TableSkeleton /> : null}

      {ordersState.status === 'error' ? (
        <ErrorState message={ordersState.message} onRetry={ordersState.retry} />
      ) : null}

      {orders && orders.length === 0 ? (
        <EmptyState
          title={status !== undefined ? 'Sin resultados' : 'Todavía no hay órdenes'}
          description={
            status !== undefined
              ? 'Ninguna orden coincide con este filtro. Probá con otro estado o mostrá todas.'
              : 'Cuando alguien complete una compra, la orden va a aparecer acá.'
          }
        />
      ) : null}

      {orders && orders.length > 0 ? (
        <table className="block w-full md:table md:table-auto">
          <thead className="hidden border-b border-ink/15 md:table-header-group dark:border-bone/15">
            <tr>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>N.º</th>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Fecha</th>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Cliente</th>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Total</th>
              <th className={`py-2 pr-4 text-left ${TABLE_LABEL_CLASSES}`}>Estado</th>
              <th className={`py-2 text-right ${TABLE_LABEL_CLASSES}`}>Acciones</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {orders.map((order) => (
              <AdminOrderRow
                key={order.id}
                order={order}
                user={auth.user}
                onMutated={ordersState.retry}
              />
            ))}
          </tbody>
        </table>
      ) : null}
    </main>
  );
}

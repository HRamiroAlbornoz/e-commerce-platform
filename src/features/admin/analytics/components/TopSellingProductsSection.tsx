import { useTopSellingProducts } from '@/features/admin/analytics/hooks/useTopSellingProducts';
import { TopSellingProductsChart } from '@/features/admin/analytics/components/TopSellingProductsChart';
import { TopSellingProductsChartSkeleton } from '@/features/admin/analytics/components/TopSellingProductsChartSkeleton';
import { TABLE_LABEL_CLASSES } from '@/features/admin/constants/tableLabelClasses';
import { ErrorState } from '@/components/states/ErrorState';

export function TopSellingProductsSection() {
  const topProductsState = useTopSellingProducts();

  return (
    <div className="flex flex-col gap-4">
      <h2 className={TABLE_LABEL_CLASSES}>Productos más vendidos</h2>

      {topProductsState.status === 'loading' ? <TopSellingProductsChartSkeleton /> : null}

      {topProductsState.status === 'error' ? (
        <ErrorState message={topProductsState.message} onRetry={topProductsState.retry} />
      ) : null}

      {topProductsState.status === 'success' && topProductsState.products.length > 0 ? (
        <TopSellingProductsChart products={topProductsState.products} />
      ) : null}

      {topProductsState.status === 'success' && topProductsState.products.length === 0 ? (
        <p className="font-body text-sm text-ink/70 dark:text-bone/70">
          Todavía no hay unidades vendidas para armar el ranking.
        </p>
      ) : null}
    </div>
  );
}

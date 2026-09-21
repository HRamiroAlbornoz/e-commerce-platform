import { formatPrice } from '@/features/products/utils/formatPrice';
import { TABLE_LABEL_CLASSES } from '@/features/admin/constants/tableLabelClasses';
import type { AnalyticsSummary } from '@/features/admin/analytics/schemas/analyticsSummary';

export const ANALYTICS_SUMMARY_CLASSES =
  'flex flex-col gap-6 border-t border-ink/15 pt-6 sm:flex-row sm:gap-0 sm:divide-x sm:divide-ink/15 dark:border-bone/15 dark:sm:divide-bone/15';

type AnalyticsSummaryTilesProps = {
  summary: AnalyticsSummary;
};

export function AnalyticsSummaryTiles({ summary }: AnalyticsSummaryTilesProps) {
  return (
    <dl className={ANALYTICS_SUMMARY_CLASSES}>
      <div className="flex flex-col gap-2 sm:pr-8">
        <dt className={TABLE_LABEL_CLASSES}>Ingresos totales</dt>
        <dd className="font-display text-3xl tabular-nums text-ink dark:text-bone">
          {formatPrice(summary.totalRevenue)}
        </dd>
      </div>
      <div className="flex flex-col gap-2 sm:pl-8">
        <dt className={TABLE_LABEL_CLASSES}>Cantidad de órdenes</dt>
        <dd className="font-display text-3xl tabular-nums text-ink dark:text-bone">
          {summary.totalOrders}
        </dd>
      </div>
    </dl>
  );
}

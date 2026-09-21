import { useOrdersSummary } from '@/features/admin/analytics/hooks/useOrdersSummary';
import { AnalyticsSummaryTiles } from '@/features/admin/analytics/components/AnalyticsSummaryTiles';
import { AnalyticsSummaryTilesSkeleton } from '@/features/admin/analytics/components/AnalyticsSummaryTilesSkeleton';
import { TopSellingProductsSection } from '@/features/admin/analytics/components/TopSellingProductsSection';
import { EmptyState } from '@/components/states/EmptyState';
import { ErrorState } from '@/components/states/ErrorState';

export function AdminAnalyticsPage() {
  const summaryState = useOrdersSummary();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8 lg:px-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-ink dark:text-bone">Analytics</h1>
      </div>

      {summaryState.status === 'loading' ? <AnalyticsSummaryTilesSkeleton /> : null}

      {summaryState.status === 'error' ? (
        <ErrorState message={summaryState.message} onRetry={summaryState.retry} />
      ) : null}

      {summaryState.status === 'success' && summaryState.summary.totalOrders === 0 ? (
        <EmptyState
          title="Todavía no hay ventas"
          description="Cuando se completen las primeras compras, los ingresos y el ranking de productos van a aparecer acá."
        />
      ) : null}

      {summaryState.status === 'success' && summaryState.summary.totalOrders > 0 ? (
        <div className="flex flex-col gap-8">
          <AnalyticsSummaryTiles summary={summaryState.summary} />
          <TopSellingProductsSection />
        </div>
      ) : null}
    </main>
  );
}

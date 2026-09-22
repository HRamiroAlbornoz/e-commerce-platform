import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getOrdersSummary } from '@/features/admin/analytics/services/getOrdersSummary';
import type { AnalyticsSummary } from '@/features/admin/analytics/schemas/analyticsSummary';

type OrdersSummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; summary: AnalyticsSummary };

export function useOrdersSummary(): OrdersSummaryState & { retry: () => void } {
  const result = useKeyedAsync(
    'admin-analytics-summary',
    getOrdersSummary,
    'No pudimos cargar el resumen de ventas. Intenta de nuevo.',
  );

  if (result.status === 'success') {
    return { status: 'success', summary: result.data, retry: result.retry };
  }

  return result;
}

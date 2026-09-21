import { collection, count, getAggregateFromServer, query, sum, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import {
  analyticsSummarySchema,
  type AnalyticsSummary,
} from '@/features/admin/analytics/schemas/analyticsSummary';

export async function getOrdersSummary(): Promise<AnalyticsSummary> {
  const nonCancelledOrdersQuery = query(
    collection(db, 'orders'),
    where('status', '!=', 'cancelled'),
  );

  const snapshot = await getAggregateFromServer(nonCancelledOrdersQuery, {
    totalRevenue: sum('total'),
    totalOrders: count(),
  });

  return analyticsSummarySchema.parse(snapshot.data());
}

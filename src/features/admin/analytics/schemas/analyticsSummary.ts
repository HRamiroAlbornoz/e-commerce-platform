import { z } from 'zod';
import { roundToCents } from '@shared/schemas/order';

const nullableTotalRevenueSchema = z
  .number()
  .nonnegative()
  .nullable()
  .transform((value) => roundToCents(value ?? 0));

const nullableTotalOrdersSchema = z
  .number()
  .int()
  .nonnegative()
  .nullable()
  .transform((value) => value ?? 0);

export const analyticsSummarySchema = z.object({
  totalRevenue: nullableTotalRevenueSchema,
  totalOrders: nullableTotalOrdersSchema,
});

export type AnalyticsSummary = z.infer<typeof analyticsSummarySchema>;

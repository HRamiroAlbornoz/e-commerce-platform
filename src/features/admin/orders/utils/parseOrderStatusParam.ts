import { orderStatusSchema, type OrderStatus } from '@shared/schemas/order';

export function parseOrderStatusParam(raw: string | null): OrderStatus | undefined {
  const result = orderStatusSchema.safeParse(raw);
  return result.success ? result.data : undefined;
}

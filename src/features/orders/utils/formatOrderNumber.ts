export function formatOrderNumber(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

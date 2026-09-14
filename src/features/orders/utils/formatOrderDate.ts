const orderDateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' });

export function formatOrderDate(date: Date): string {
  return orderDateFormatter.format(date);
}

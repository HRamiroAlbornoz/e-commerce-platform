const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' });

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

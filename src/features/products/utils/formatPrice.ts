const priceFormatter = new Intl.NumberFormat('es-AR');

export function formatPrice(price: number): string {
  return `$${priceFormatter.format(price)}`;
}

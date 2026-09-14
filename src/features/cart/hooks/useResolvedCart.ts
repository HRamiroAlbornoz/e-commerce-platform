import { useCallback } from 'react';
import { useCart } from '@/hooks/useCart';
import { useKeyedAsync } from '@/hooks/useKeyedAsync';
import { getProductsByIds } from '@/features/products/services/getProductsByIds';
import type { CartItem } from '@shared/schemas/cart';
import type { Product } from '@shared/schemas/product';
import { roundToCents } from '@shared/schemas/order';

export type CartLine = { product: Product; quantity: number; lineTotal: number };

type ResolvedCartState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; lines: CartLine[]; total: number };

function toItemsKey(items: CartItem[]): string {
  return items.map((item) => `${item.productId}:${item.quantity}`).join(',');
}

async function resolveCartLines(items: CartItem[]): Promise<CartLine[]> {
  if (items.length === 0) {
    return [];
  }

  const products = await getProductsByIds(items.map((item) => item.productId));
  const productsById = new Map(products.map((product) => [product.id, product]));

  return items.flatMap((item) => {
    const product = productsById.get(item.productId);
    return product
      ? [{ product, quantity: item.quantity, lineTotal: roundToCents(product.price * item.quantity) }]
      : [];
  });
}

export function useResolvedCart(): ResolvedCartState & { retry: () => void } {
  const { items } = useCart();
  const itemsKey = toItemsKey(items);
  const fetchLines = useCallback(() => resolveCartLines(items), [items]);
  const result = useKeyedAsync(itemsKey, fetchLines, 'No pudimos cargar el carrito. Intenta de nuevo.');

  if (result.status !== 'success') {
    return result;
  }

  return {
    status: 'success',
    lines: result.data,
    total: roundToCents(result.data.reduce((sum, line) => sum + line.lineTotal, 0)),
    retry: result.retry,
  };
}

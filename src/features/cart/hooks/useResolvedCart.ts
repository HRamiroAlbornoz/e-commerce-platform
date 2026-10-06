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

function toProductIdsKey(items: CartItem[]): string {
  return items
    .map((item) => item.productId)
    .sort()
    .join(',');
}

async function fetchProductsByIdsKey(productIdsKey: string): Promise<Product[]> {
  if (productIdsKey === '') {
    return [];
  }

  return getProductsByIds(productIdsKey.split(','));
}

function buildCartLines(items: CartItem[], productsById: Map<string, Product>): CartLine[] {
  return items.flatMap((item) => {
    const product = productsById.get(item.productId);
    return product
      ? [
          {
            product,
            quantity: item.quantity,
            lineTotal: roundToCents(product.price * item.quantity),
          },
        ]
      : [];
  });
}

export function useResolvedCart(): ResolvedCartState & { retry: () => void } {
  const { items } = useCart();
  const productIdsKey = toProductIdsKey(items);
  const fetchProducts = useCallback(() => fetchProductsByIdsKey(productIdsKey), [productIdsKey]);
  const result = useKeyedAsync(
    productIdsKey,
    fetchProducts,
    'No pudimos cargar el carrito. Intenta de nuevo.',
  );

  if (result.status !== 'success') {
    return result;
  }

  const productsById = new Map(result.data.map((product) => [product.id, product]));
  const lines = buildCartLines(items, productsById);

  return {
    status: 'success',
    lines,
    total: roundToCents(lines.reduce((sum, line) => sum + line.lineTotal, 0)),
    retry: result.retry,
  };
}

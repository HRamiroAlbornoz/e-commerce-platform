import { useCallback, useState } from 'react';
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

function toMissingIdsKey(items: CartItem[], productsById: Map<string, Product>): string {
  return items
    .map((item) => item.productId)
    .filter((productId) => !productsById.has(productId))
    .sort()
    .join(',');
}

async function fetchProductsByIdsKey(missingIdsKey: string): Promise<Product[]> {
  if (missingIdsKey === '') {
    return [];
  }

  return getProductsByIds(missingIdsKey.split(','));
}

function mergeProducts(current: Map<string, Product>, products: Product[]): Map<string, Product> {
  const next = new Map(current);
  for (const product of products) {
    next.set(product.id, product);
  }
  return next;
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
  const [productsById, setProductsById] = useState<Map<string, Product>>(() => new Map());
  const missingIdsKey = toMissingIdsKey(items, productsById);

  const fetchMissingProducts = useCallback(async () => {
    const products = await fetchProductsByIdsKey(missingIdsKey);
    setProductsById((current) => mergeProducts(current, products));
    return products;
  }, [missingIdsKey]);

  const result = useKeyedAsync(
    missingIdsKey,
    fetchMissingProducts,
    'No pudimos cargar el carrito. Intenta de nuevo.',
  );
  const lines = buildCartLines(items, productsById);

  const isInitialLoad = result.status === 'loading' && lines.length === 0 && items.length > 0;
  if (result.status === 'error' || isInitialLoad) {
    return result;
  }

  return {
    status: 'success',
    lines,
    total: roundToCents(lines.reduce((sum, line) => sum + line.lineTotal, 0)),
    retry: result.retry,
  };
}

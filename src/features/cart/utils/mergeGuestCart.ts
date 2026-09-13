import type { CartItem } from '@shared/schemas/cart';
import type { Product } from '@shared/schemas/product';

export type MergeExclusion = { productId: string; productName: string; reason: 'inactive' | 'out-of-stock' };

export type MergeResult = { items: CartItem[]; exclusions: MergeExclusion[] };

function maxQuantityByProductId(guestItems: CartItem[], existingItems: CartItem[]): Map<string, number> {
  const quantities = new Map<string, number>();

  for (const item of [...existingItems, ...guestItems]) {
    const currentMax = quantities.get(item.productId) ?? 0;
    quantities.set(item.productId, Math.max(currentMax, item.quantity));
  }

  return quantities;
}

export function mergeGuestCart(
  guestItems: CartItem[],
  existingItems: CartItem[],
  products: Product[],
): MergeResult {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const items: CartItem[] = [];
  const exclusions: MergeExclusion[] = [];

  for (const [productId, quantity] of maxQuantityByProductId(guestItems, existingItems)) {
    const product = productsById.get(productId);

    if (!product || !product.isActive) {
      exclusions.push({
        productId,
        productName: product?.name ?? productId,
        reason: 'inactive',
      });
      continue;
    }

    if (product.stock === 0) {
      exclusions.push({ productId, productName: product.name, reason: 'out-of-stock' });
      continue;
    }

    items.push({ productId, quantity: Math.min(quantity, product.stock) });
  }

  return { items, exclusions };
}

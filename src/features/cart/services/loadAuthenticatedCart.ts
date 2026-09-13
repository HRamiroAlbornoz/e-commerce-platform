import { getCart } from '@/features/cart/services/getCart';
import { setCart } from '@/features/cart/services/setCart';
import { getProductsByIds } from '@/features/products/services/getProductsByIds';
import { mergeGuestCart, type MergeExclusion } from '@/features/cart/utils/mergeGuestCart';
import { clearGuestCart } from '@/features/cart/utils/guestCartStorage';
import type { CartItem } from '@shared/schemas/cart';

export type LoadAuthenticatedCartResult = { items: CartItem[]; exclusions: MergeExclusion[] };

export async function loadAuthenticatedCart(
  uid: string,
  guestItems: CartItem[],
): Promise<LoadAuthenticatedCartResult> {
  const existingItems = await getCart(uid);

  if (guestItems.length === 0) {
    return { items: existingItems, exclusions: [] };
  }

  const productIds = [...new Set([...guestItems, ...existingItems].map((item) => item.productId))];
  const products = await getProductsByIds(productIds);
  const merged = mergeGuestCart(guestItems, existingItems, products);

  await setCart(uid, merged.items);
  clearGuestCart();

  return merged;
}

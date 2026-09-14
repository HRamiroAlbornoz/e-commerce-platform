import { guestCartSchema, type CartItem } from '@shared/schemas/cart';
import { safeStorageGet, safeStorageRemove, safeStorageSet } from '@/lib/webStorage';

const GUEST_CART_STORAGE_KEY = 'clack:guest-cart';

export function readGuestCart(): CartItem[] {
  const raw = safeStorageGet(localStorage, GUEST_CART_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const result = guestCartSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data.items : [];
  } catch {
    return [];
  }
}

export function writeGuestCart(items: CartItem[]): void {
  safeStorageSet(localStorage, GUEST_CART_STORAGE_KEY, JSON.stringify({ items }));
}

export function clearGuestCart(): void {
  safeStorageRemove(localStorage, GUEST_CART_STORAGE_KEY);
}

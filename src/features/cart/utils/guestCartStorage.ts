import { guestCartSchema, type CartItem } from '@shared/schemas/cart';

const GUEST_CART_STORAGE_KEY = 'clack:guest-cart';

export function readGuestCart(): CartItem[] {
  const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);

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
  try {
    localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify({ items }));
  } catch {
    return;
  }
}

export function clearGuestCart(): void {
  try {
    localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } catch {
    return;
  }
}

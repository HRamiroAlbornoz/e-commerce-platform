import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { cartConverter } from '@/lib/firebase/converters/cart';
import type { CartItem } from '@shared/schemas/cart';

export async function setCart(uid: string, items: CartItem[]): Promise<void> {
  const cartRef = doc(db, 'carts', uid).withConverter(cartConverter);

  await setDoc(cartRef, { items, updatedAt: serverTimestamp() });
}

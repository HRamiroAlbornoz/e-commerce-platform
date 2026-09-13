import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { cartConverter } from '@/lib/firebase/converters/cart';
import type { CartItem } from '@shared/schemas/cart';

export async function getCart(uid: string): Promise<CartItem[]> {
  const cartRef = doc(db, 'carts', uid).withConverter(cartConverter);
  const snapshot = await getDoc(cartRef);

  assertFromServer(snapshot, 'No se pudo confirmar el carrito con el servidor.');

  return snapshot.exists() ? snapshot.data().items : [];
}

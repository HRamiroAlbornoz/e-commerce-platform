import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { productConverter } from '@/lib/firebase/converters/product';
import type { Product } from '@shared/schemas/product';

export async function getProductById(id: string): Promise<Product | null> {
  const productRef = doc(db, 'products', id).withConverter(productConverter);
  const snapshot = await getDoc(productRef);

  assertFromServer(snapshot, 'No se pudo confirmar el producto con el servidor.');

  if (!snapshot.exists()) {
    return null;
  }

  const product = snapshot.data();
  return product.isActive ? product : null;
}

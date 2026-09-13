import { collection, documentId, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { productConverter } from '@/lib/firebase/converters/product';
import type { Product } from '@shared/schemas/product';

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) {
    return [];
  }

  const productsRef = collection(db, 'products').withConverter(productConverter);
  const snapshot = await getDocs(query(productsRef, where(documentId(), 'in', ids)));

  assertFromServer(snapshot, 'No se pudo confirmar los productos con el servidor.');

  return snapshot.docs.map((productDoc) => productDoc.data());
}

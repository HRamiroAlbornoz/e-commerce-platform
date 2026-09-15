import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { productConverter } from '@/lib/firebase/converters/product';
import type { Product } from '@shared/schemas/product';

export async function getAdminProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products').withConverter(productConverter);
  const adminProductsQuery = query(productsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(adminProductsQuery);

  assertFromServer(snapshot, 'No se pudo confirmar el catálogo con el servidor.');

  return snapshot.docs.map((productDoc) => productDoc.data());
}

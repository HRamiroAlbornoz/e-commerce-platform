import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { productConverter } from '@/lib/firebase/converters/product';
import type { Product } from '@shared/schemas/product';

export async function getFeaturedProduct(): Promise<Product | null> {
  const featuredProductQuery = query(
    collection(db, 'products'),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(1),
  ).withConverter(productConverter);

  const snapshot = await getDocs(featuredProductQuery);
  assertFromServer(snapshot, 'No se pudo confirmar la pieza destacada con el servidor.');

  const [featuredDoc] = snapshot.docs;
  return featuredDoc ? featuredDoc.data() : null;
}

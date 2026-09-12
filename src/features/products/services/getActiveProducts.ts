import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { productConverter } from '@/lib/firebase/converters/product';
import type { Product } from '@shared/schemas/product';

const PRODUCTS_PAGE_SIZE = 24;

export async function getActiveProducts(): Promise<Product[]> {
  const productsRef = collection(db, 'products').withConverter(productConverter);
  const activeProductsQuery = query(
    productsRef,
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(PRODUCTS_PAGE_SIZE),
  );

  const snapshot = await getDocs(activeProductsQuery);

  if (snapshot.metadata.fromCache) {
    throw new Error('No se pudo confirmar el catalogo con el servidor.');
  }

  return snapshot.docs.map((productDoc) => productDoc.data());
}

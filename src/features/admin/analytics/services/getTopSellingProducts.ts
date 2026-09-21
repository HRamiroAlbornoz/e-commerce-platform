import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { productConverter } from '@/lib/firebase/converters/product';
import { TOP_PRODUCTS_LIMIT } from '@/features/admin/analytics/constants';
import type { Product } from '@shared/schemas/product';

export async function getTopSellingProducts(): Promise<Product[]> {
  const topProductsQuery = query(
    collection(db, 'products'),
    where('unitsSold', '>', 0),
    orderBy('unitsSold', 'desc'),
    limit(TOP_PRODUCTS_LIMIT),
  ).withConverter(productConverter);

  const snapshot = await getDocs(topProductsQuery);
  assertFromServer(snapshot, 'No se pudo confirmar el ranking de productos con el servidor.');

  return snapshot.docs.map((doc) => doc.data());
}

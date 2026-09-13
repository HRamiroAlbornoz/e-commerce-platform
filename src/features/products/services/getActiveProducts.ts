import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { productConverter } from '@/lib/firebase/converters/product';
import { toNameLower, type Product, type ProductCategory } from '@shared/schemas/product';

const PRODUCTS_PAGE_SIZE = 24;
const UNICODE_PREFIX_RANGE_CEILING = '';

export type ProductFilters = {
  category?: ProductCategory | undefined;
  searchTerm?: string | undefined;
};

export async function getActiveProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const productsRef = collection(db, 'products').withConverter(productConverter);
  const constraints: QueryConstraint[] = [where('isActive', '==', true)];

  if (filters.category) {
    constraints.push(where('category', '==', filters.category));
  }

  const normalizedSearchTerm = filters.searchTerm ? toNameLower(filters.searchTerm) : '';

  if (normalizedSearchTerm) {
    constraints.push(
      where('nameLower', '>=', normalizedSearchTerm),
      where('nameLower', '<', normalizedSearchTerm + UNICODE_PREFIX_RANGE_CEILING),
      orderBy('nameLower'),
    );
  } else {
    constraints.push(orderBy('createdAt', 'desc'));
  }

  constraints.push(limit(PRODUCTS_PAGE_SIZE));

  const activeProductsQuery = query(productsRef, ...constraints);
  const snapshot = await getDocs(activeProductsQuery);

  assertFromServer(snapshot, 'No se pudo confirmar el catalogo con el servidor.');

  return snapshot.docs.map((productDoc) => productDoc.data());
}

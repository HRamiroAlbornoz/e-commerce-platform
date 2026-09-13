import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { productConverter } from '@/lib/firebase/converters/product';
import { toNameLower, type Product, type ProductCategory } from '@shared/schemas/product';

export const PRODUCTS_PAGE_SIZE = 8;
const UNICODE_PREFIX_RANGE_CEILING = '';

export type ProductFilters = {
  category?: ProductCategory | undefined;
  searchTerm?: string | undefined;
};

export type ProductsPage = {
  products: Product[];
  lastDoc: QueryDocumentSnapshot<Product> | null;
  hasNextPage: boolean;
};

export async function getActiveProducts(
  filters: ProductFilters = {},
  cursor?: QueryDocumentSnapshot<Product>,
): Promise<ProductsPage> {
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

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(PRODUCTS_PAGE_SIZE + 1));

  const activeProductsQuery = query(productsRef, ...constraints);
  const snapshot = await getDocs(activeProductsQuery);

  assertFromServer(snapshot, 'No se pudo confirmar el catalogo con el servidor.');

  const hasNextPage = snapshot.docs.length > PRODUCTS_PAGE_SIZE;
  const pageDocs = hasNextPage ? snapshot.docs.slice(0, PRODUCTS_PAGE_SIZE) : snapshot.docs;

  return {
    products: pageDocs.map((productDoc) => productDoc.data()),
    lastDoc: pageDocs.at(-1) ?? null,
    hasNextPage,
  };
}

import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { reviewConverter } from '@/lib/firebase/converters/review';
import type { Review } from '@shared/schemas/review';

export async function getProductReviews(productId: string): Promise<Review[]> {
  const reviewsQuery = query(
    collection(db, 'products', productId, 'reviews'),
    orderBy('createdAt', 'desc'),
  ).withConverter(reviewConverter);

  const snapshot = await getDocs(reviewsQuery);
  assertFromServer(snapshot, 'No se pudieron confirmar las reseñas con el servidor.');

  return snapshot.docs.map((doc) => doc.data());
}

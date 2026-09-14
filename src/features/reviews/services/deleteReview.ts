import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export async function deleteReview(productId: string, uid: string): Promise<void> {
  await deleteDoc(doc(db, 'products', productId, 'reviews', uid));
}

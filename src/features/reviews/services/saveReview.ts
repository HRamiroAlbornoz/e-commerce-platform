import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from '@/lib/firebase/client';
import { reviewConverter } from '@/lib/firebase/converters/review';
import type { ReviewInput } from '@shared/schemas/review';

export async function saveReview(
  user: User,
  productId: string,
  input: ReviewInput,
  existingCreatedAt?: Date,
): Promise<void> {
  const reviewRef = doc(db, 'products', productId, 'reviews', user.uid).withConverter(
    reviewConverter,
  );

  await setDoc(reviewRef, {
    userId: user.uid,
    displayName: user.displayName ?? 'Usuario',
    rating: input.rating,
    comment: input.comment,
    createdAt: existingCreatedAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

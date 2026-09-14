import {
  Timestamp,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from 'firebase/firestore';
import { reviewSchema, type Review } from '@shared/schemas/review';

export const reviewConverter: FirestoreDataConverter<Review> = {
  toFirestore(review: WithFieldValue<Review>) {
    return {
      userId: review.userId,
      displayName: review.displayName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Review {
    const data: Record<string, unknown> = snapshot.data(options);
    const createdAt =
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
    const updatedAt =
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt;

    return reviewSchema.parse({
      ...data,
      createdAt,
      updatedAt,
    });
  },
};

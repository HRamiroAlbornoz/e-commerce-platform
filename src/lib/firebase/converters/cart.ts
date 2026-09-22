import {
  Timestamp,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from 'firebase/firestore';
import { cartSchema, type Cart } from '@shared/schemas/cart';

export const cartConverter: FirestoreDataConverter<Cart> = {
  toFirestore(cart: WithFieldValue<Cart>) {
    return {
      items: cart.items,
      updatedAt: cart.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Cart {
    const data: Record<string, unknown> = snapshot.data(options);
    const updatedAt =
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt;

    return cartSchema.parse({ ...data, updatedAt });
  },
};

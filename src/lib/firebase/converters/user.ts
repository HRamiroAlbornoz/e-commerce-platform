import {
  Timestamp,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from 'firebase/firestore';
import { userSchema, type User } from '@shared/schemas/user';

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore(user: WithFieldValue<User>) {
    return {
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      createdAt: user.createdAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): User {
    const data: Record<string, unknown> = snapshot.data(options);
    const createdAt =
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;

    return userSchema.parse({
      ...data,
      uid: snapshot.id,
      createdAt,
    });
  },
};

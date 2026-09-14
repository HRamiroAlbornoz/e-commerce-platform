import {
  Timestamp,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from 'firebase/firestore';
import { orderSchema, type Order } from '@shared/schemas/order';

export const orderConverter: FirestoreDataConverter<Order> = {
  toFirestore(order: WithFieldValue<Order>) {
    return {
      userId: order.userId,
      items: order.items,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      status: order.status,
      shipping: order.shipping,
      payment: order.payment,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Order {
    const data: Record<string, unknown> = snapshot.data(options);
    const createdAt =
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
    const updatedAt =
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt;

    return orderSchema.parse({
      ...data,
      id: snapshot.id,
      createdAt,
      updatedAt,
    });
  },
};

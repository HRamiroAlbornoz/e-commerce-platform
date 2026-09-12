import {
  Timestamp,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from 'firebase/firestore';
import { productSchema, type Product } from '@shared/schemas/product';

export const productConverter: FirestoreDataConverter<Product> = {
  toFirestore(product: WithFieldValue<Product>) {
    return {
      name: product.name,
      nameLower: product.nameLower,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      color: product.color,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      orderCount: product.orderCount,
      unitsSold: product.unitsSold,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Product {
    const data: Record<string, unknown> = snapshot.data(options);
    const createdAt =
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
    const updatedAt =
      data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt;

    return productSchema.parse({
      ...data,
      id: snapshot.id,
      createdAt,
      updatedAt,
    });
  },
};

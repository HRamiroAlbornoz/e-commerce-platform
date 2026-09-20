import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin.js';
import type { Order } from '../../shared/schemas/order.js';

export async function cancelOrderAndRestoreStock(
  tx: FirebaseFirestore.Transaction,
  order: Order,
  orderRef: FirebaseFirestore.DocumentReference,
): Promise<void> {
  const quantityByProductId = new Map<string, number>();
  for (const item of order.items) {
    quantityByProductId.set(
      item.productId,
      (quantityByProductId.get(item.productId) ?? 0) + item.quantity,
    );
  }
  const productIds = [...quantityByProductId.keys()];
  const productSnaps = await tx.getAll(...productIds.map((id) => adminDb.doc(`products/${id}`)));

  tx.update(orderRef, { status: 'cancelled', updatedAt: FieldValue.serverTimestamp() });

  productIds.forEach((productId, index) => {
    const snap = productSnaps[index];
    if (!snap?.exists) {
      return;
    }

    const quantity = quantityByProductId.get(productId) ?? 0;
    tx.update(snap.ref, {
      stock: FieldValue.increment(quantity),
      orderCount: FieldValue.increment(-1),
      unitsSold: FieldValue.increment(-quantity),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}

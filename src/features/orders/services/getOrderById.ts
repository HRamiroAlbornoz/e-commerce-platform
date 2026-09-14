import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { orderConverter } from '@/lib/firebase/converters/order';
import type { Order } from '@shared/schemas/order';

function isPermissionDeniedError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 'permission-denied';
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orderRef = doc(db, 'orders', id).withConverter(orderConverter);

  try {
    const snapshot = await getDoc(orderRef);
    assertFromServer(snapshot, 'No se pudo confirmar la orden con el servidor.');

    return snapshot.exists() ? snapshot.data() : null;
  } catch (err) {
    if (isPermissionDeniedError(err)) {
      return null;
    }
    throw err;
  }
}

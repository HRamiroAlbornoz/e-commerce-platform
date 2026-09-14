import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { orderConverter } from '@/lib/firebase/converters/order';
import type { Order } from '@shared/schemas/order';

export async function getOrders(uid: string): Promise<Order[]> {
  const ordersQuery = query(
    collection(db, 'orders'),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
  ).withConverter(orderConverter);

  const snapshot = await getDocs(ordersQuery);
  assertFromServer(snapshot, 'No se pudo confirmar el historial de órdenes con el servidor.');

  return snapshot.docs.map((doc) => doc.data());
}

import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { assertFromServer } from '@/lib/firebase/assertFromServer';
import { orderConverter } from '@/lib/firebase/converters/order';
import type { Order, OrderStatus } from '@shared/schemas/order';

export async function getAllOrders(status: OrderStatus | undefined): Promise<Order[]> {
  const constraints = status ? [where('status', '==', status)] : [];
  const ordersQuery = query(
    collection(db, 'orders'),
    ...constraints,
    orderBy('createdAt', 'desc'),
  ).withConverter(orderConverter);

  const snapshot = await getDocs(ordersQuery);
  assertFromServer(snapshot, 'No se pudo confirmar el listado de órdenes con el servidor.');

  return snapshot.docs.map((doc) => doc.data());
}

import { randomUUID } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '../_lib/firebaseAdmin.js';
import { verifyRequestToken } from '../_lib/verifyRequestToken.js';
import { OrderError, respondWithError } from '../_lib/orderErrors.js';
import {
  createOrderRequestSchema,
  roundToCents,
  SHIPPING_COST,
  type CreateOrderResponse,
  type OrderItem,
} from '../../shared/schemas/order.js';
import { cartSchema } from '../../shared/schemas/cart.js';
import { productSchema } from '../../shared/schemas/product.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const requestId = randomUUID();

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    respondWithError(res, requestId, new OrderError('INVALID_REQUEST', 'Método no permitido.'));
    return;
  }

  const auth = await verifyRequestToken(req);
  if (!auth.ok) {
    respondWithError(
      res,
      requestId,
      new OrderError('UNAUTHENTICATED', 'Sesión inválida o expirada. Inicia sesión de nuevo.'),
    );
    return;
  }

  const parsedBody = createOrderRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    respondWithError(
      res,
      requestId,
      new OrderError('INVALID_REQUEST', 'La solicitud de compra no tiene un formato válido.'),
    );
    return;
  }

  const { orderRequestId, shipping, payment, expectedItems } = parsedBody.data;
  const expectedByProductId = new Map(expectedItems.map((item) => [item.productId, item]));

  try {
    const orderId = await adminDb.runTransaction(async (tx) => {
      const orderRef = adminDb.doc(`orders/${orderRequestId}`);
      const cartRef = adminDb.doc(`carts/${auth.uid}`);

      const [existingOrderSnap, cartSnap] = await tx.getAll(orderRef, cartRef);
      if (!existingOrderSnap || !cartSnap) {
        throw new OrderError('INTERNAL_ERROR', 'No pudimos confirmar el estado de tu carrito.');
      }

      if (existingOrderSnap.exists) {
        return orderRequestId;
      }

      const rawCart: Record<string, unknown> = cartSnap.data() ?? {};
      const cartUpdatedAt =
        rawCart.updatedAt instanceof Timestamp ? rawCart.updatedAt.toDate() : rawCart.updatedAt;
      const cart = cartSchema.parse({
        items: rawCart.items ?? [],
        updatedAt: cartUpdatedAt ?? new Date(),
      });

      if (cart.items.length === 0) {
        throw new OrderError('EMPTY_CART', 'Tu carrito está vacío.');
      }

      const quantityByProductId = new Map<string, number>();
      for (const item of cart.items) {
        quantityByProductId.set(
          item.productId,
          (quantityByProductId.get(item.productId) ?? 0) + item.quantity,
        );
      }
      const aggregatedItems = [...quantityByProductId.entries()].map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const productRefs = aggregatedItems.map((item) => adminDb.doc(`products/${item.productId}`));
      const productSnaps = await tx.getAll(...productRefs);
      const cartItemsWithSnaps = aggregatedItems.map((item, index) => {
        const snap = productSnaps[index];
        if (!snap) {
          throw new OrderError(
            'INTERNAL_ERROR',
            'No pudimos leer uno de los productos del carrito.',
          );
        }
        return { item, snap };
      });

      const orderItems: OrderItem[] = [];
      let subtotal = 0;

      for (const { item: cartItem, snap } of cartItemsWithSnaps) {
        if (!snap.exists) {
          throw new OrderError(
            'PRODUCT_UNAVAILABLE',
            'Uno de los productos de tu carrito ya no está disponible.',
            cartItem.productId,
          );
        }

        const rawProduct: Record<string, unknown> = snap.data() ?? {};
        const createdAt =
          rawProduct.createdAt instanceof Timestamp
            ? rawProduct.createdAt.toDate()
            : rawProduct.createdAt;
        const updatedAt =
          rawProduct.updatedAt instanceof Timestamp
            ? rawProduct.updatedAt.toDate()
            : rawProduct.updatedAt;
        const product = productSchema.parse({ ...rawProduct, id: snap.id, createdAt, updatedAt });

        if (!product.isActive) {
          throw new OrderError(
            'PRODUCT_UNAVAILABLE',
            `"${product.name}" ya no está disponible.`,
            product.id,
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new OrderError(
            'OUT_OF_STOCK',
            `Nos quedamos sin stock de "${product.name}".`,
            product.id,
          );
        }

        const expected = expectedByProductId.get(cartItem.productId);
        if (!expected || expected.quantity !== cartItem.quantity) {
          throw new OrderError(
            'CART_CHANGED',
            'Tu carrito cambió desde que lo revisaste. Volvé a revisar antes de confirmar.',
            product.id,
          );
        }

        if (roundToCents(expected.unitPrice) !== roundToCents(product.price)) {
          throw new OrderError(
            'PRICE_CHANGED',
            `El precio de "${product.name}" cambió. Revisá el total antes de confirmar.`,
            product.id,
          );
        }

        orderItems.push({
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          imageUrl: product.imageUrl,
          quantity: cartItem.quantity,
        });
        subtotal = roundToCents(subtotal + product.price * cartItem.quantity);
      }

      tx.set(orderRef, {
        userId: auth.uid,
        items: orderItems,
        subtotal,
        shippingCost: SHIPPING_COST,
        total: roundToCents(subtotal + SHIPPING_COST),
        status: 'pending',
        shipping,
        payment,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      for (const { item: cartItem, snap } of cartItemsWithSnaps) {
        tx.update(snap.ref, {
          stock: FieldValue.increment(-cartItem.quantity),
          orderCount: FieldValue.increment(1),
          unitsSold: FieldValue.increment(cartItem.quantity),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      tx.set(cartRef, { items: [], updatedAt: FieldValue.serverTimestamp() });

      return orderRequestId;
    });

    const response: CreateOrderResponse = { orderId };
    res.status(200).json(response);
  } catch (err) {
    if (err instanceof OrderError) {
      respondWithError(res, requestId, err);
      return;
    }

    respondWithError(
      res,
      requestId,
      new OrderError('INTERNAL_ERROR', 'No pudimos procesar tu compra. Intenta de nuevo.'),
    );
  }
}

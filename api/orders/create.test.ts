import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SHIPPING_COST } from '../../shared/schemas/order.js';

// Clave RSA generada localmente solo para que `cert()` pueda parsear un PEM
// valido al inicializar el Admin SDK en este test. Nunca sale del emulador:
// FIRESTORE_EMULATOR_HOST (seteado por `firebase emulators:exec`) hace que el
// SDK ignore la autenticacion real y hable directo con el emulador local.
process.env.FIREBASE_ADMIN_PROJECT_ID = 'clack-add2a';
process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'test@clack-add2a.iam.gserviceaccount.com';
process.env.FIREBASE_ADMIN_PRIVATE_KEY =
  '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCvz3oEb0NvAFXc\nWEJ5l5148U1pXZ7p175NgoWObdrRyi4gWVEJtXcaih2mA4QjuDUJPX6Whp67Dhdg\n4eK7/V/2l2IAwz4m4UlHSseeldi2e/0lkRKpyEdukJ7BOhH/2hzmYdgO8KbMElUN\nmYtM8X6HOjZzLJzX5gr8mLlcNWTSBQWQFxu6Mxndq13QIlHIuV79AuX9LVmrBcX4\nUaSs9/zHm7eugYWXPrke5R/TwxqeemVUPSB6sQ2uv1r/s0+qBQbeeM+7yjeNIevl\nF7Mob721rsB1px3pIgzB94qKb+94ncvbEA6aCXMJSc+GeQN0Nm1DuSdOo/M/WNZF\nAMkESaNBAgMBAAECggEAFwcN7FbGdluM43eL/XEmZxj0EsD4d5iSjIR0CdvJtYDN\n2d7ZBnSGTSuaBoyfWi5eg/9R/VVUpRuLZF0x3X2qfBoH9CGemmkXuAbLbrIh2IUU\n+z6tOx/Ie2rl4FlC0kg3UNWv/wT2U/Ryv31FCab3865kQ2GsiXrQJZW7caBsvDVE\njbmAa39uwUDaQ4R0HampwRgegYFCTHIHcnIpcf9bCh11DjGhidJNj6Z87pKbNpJy\nYt8qeahsuXn+gtX3N+nPt1tBild/dqKxKS55+3to17p6Vnsb7KN5bfv94DpZSqnU\nxUmBeukwgIZkxtVl4zTjf+FPDJmqeMUJkh0mUuHpgQKBgQDdI130MivWGXn6V7/6\ny6F/jM8T00v/1LQh3RNXO9JX3+h+P4usRB+nLebBn6nnq5p/F0LEmQVbrkUvjVkm\nV7SGXoUT2tejJi2wSbHjPv/G9vxMvCnWgKdDFMgBwnJ5QaCZvwA1oAaOhXwcni0t\nQaEq1UtoFBEyLjM6tf/8FQ8TBQKBgQDLhslu9RC9qXu4wLaSGB6SDha5x5dG0agh\nd8QIIPWJ5rsfUadc63Yr44MfTh4n8FHp5ZwylP+5lG/pNwzMk2rB1jsLKPgDZiyL\narzM/Y5foMZucne4Q/6LH8hZ5J0HXNSnR8YpfG/Szv1++powmki2erEPN3NJ8PPp\nmccM37a8DQKBgQCBN4RUB+kTjwl2nkXg75Ir7QSnqgUztX+Ydg0yIROVI5JACzO7\ncococirvozNt2xlJADeUl3HJE7j7w1V/kSo8hgivBGaSv+FcrINUrWBaS8I7uIud\n+slB6mfAl3W6ov2MOU6PBzYtm5RdSJRPaJUbaU1JwMgXkWV//g9ZppiLXQKBgQCz\nJFenD5QFrOlWjGHmo848tqPwMCsKTb4Uf0uP8BrPn8Ry47dRhXuFVAN1CZhnhRNE\nsjLTHu0cFviOKUNdyh/8r6lWwF/U9hkdOf0m3cN0jpo6WwzfpxGkuXvrC9vfwCj5\neKaGm539yu27167iOtrnq4SvpRoYKjs3EYDv5vX7/QKBgQDAf5nIFVelJBa+Fbln\nYxhLwTxK8x0nUueDmdnKV3iS2d7XiXPyYzMOADg20uJ8kuUBiiONRqMSgL056xnB\nXFj0fvS1sjuuV5SCiQdolsXLVuTtbytja+AMYbYiAflXlt5rAaI3kQtm81PSgLQI\nm4bm/jp5CYXest5Gh5JL7CUtZw==\n-----END PRIVATE KEY-----\n';

const mockVerifyRequestToken = vi.fn();
vi.mock('../_lib/verifyRequestToken.js', () => ({ verifyRequestToken: mockVerifyRequestToken }));

const { default: handler } = await import('./create.js');
const { adminDb } = await import('../_lib/firebaseAdmin.js');
const { Timestamp } = await import('firebase-admin/firestore');

const SHIPPING: Record<string, string> = {
  fullName: 'Hernán Albornoz',
  address: 'Av. Siempre Viva 742',
  city: 'Springfield',
  postalCode: '1000',
  phone: '1122334455',
};

const PAYMENT_SUCCESS = { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' };
const PAYMENT_ERROR = { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'error' };

async function seedProduct(id: string, overrides: Record<string, unknown> = {}): Promise<void> {
  await adminDb.doc(`products/${id}`).set({
    name: 'Teclado Aurora',
    nameLower: 'teclado aurora',
    description: 'Descripcion',
    price: 10000,
    stock: 5,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Switches', value: 'Lineales' }],
    curatorialNote: 'Nota curatorial',
    ratingAverage: 0,
    ratingCount: 0,
    orderCount: 0,
    unitsSold: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  });
}

async function seedCart(uid: string, items: { productId: string; quantity: number }[]): Promise<void> {
  await adminDb.doc(`carts/${uid}`).set({ items, updatedAt: Timestamp.now() });
}

function mockAuthenticatedAs(uid: string): void {
  mockVerifyRequestToken.mockResolvedValueOnce({ ok: true, uid });
}

function buildRequest(body: unknown): VercelRequest {
  return {
    method: 'POST',
    headers: { authorization: 'Bearer fake-token' },
    body,
  } as unknown as VercelRequest;
}

function buildResponse(): { res: VercelResponse; status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const res = { status, setHeader: vi.fn() } as unknown as VercelResponse;
  return { res, status, json };
}

describe('POST /api/orders/create', () => {
  it('crea la orden, descuenta stock, suma orderCount/unitsSold y vacia el carrito (F6.5, F6.6)', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    const orderRequestId = randomUUID();
    await seedProduct(productId, { price: 10000, stock: 5 });
    await seedCart(uid, [{ productId, quantity: 2 }]);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId,
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 2, unitPrice: 10000 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ orderId: orderRequestId });

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()).toMatchObject({ stock: 3, orderCount: 1, unitsSold: 2 });

    const cartSnap = await adminDb.doc(`carts/${uid}`).get();
    expect(cartSnap.data()?.items).toEqual([]);

    const orderSnap = await adminDb.doc(`orders/${orderRequestId}`).get();
    expect(orderSnap.data()).toMatchObject({
      userId: uid,
      status: 'pending',
      subtotal: 20000,
      shippingCost: SHIPPING_COST,
      total: 20000 + SHIPPING_COST,
      items: [{ productId, name: 'Teclado Aurora', unitPrice: 10000, quantity: 2, imageUrl: 'https://placehold.co/600x400' }],
    });
  });

  it('sin stock suficiente, falla sin escribir nada y nombra el producto (F6.7)', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    await seedProduct(productId, { name: 'Mouse Vector', stock: 1 });
    await seedCart(uid, [{ productId, quantity: 2 }]);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId: randomUUID(),
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 2, unitPrice: 10000 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      code: 'OUT_OF_STOCK',
      message: expect.stringContaining('Mouse Vector'),
      details: { productId },
    });

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()?.stock).toBe(1);
  });

  it('lineas duplicadas del mismo producto en el carrito se agregan antes de validar stock, no lo burlan', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    await seedProduct(productId, { name: 'Mouse Vector', stock: 1 });
    await seedCart(uid, [
      { productId, quantity: 1 },
      { productId, quantity: 1 },
    ]);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId: randomUUID(),
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 2, unitPrice: 10000 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'OUT_OF_STOCK' }));

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()?.stock).toBe(1);
  });

  it('lineas duplicadas del mismo producto se compran agregadas, con un solo descuento de stock', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    const orderRequestId = randomUUID();
    await seedProduct(productId, { price: 10000, stock: 5 });
    await seedCart(uid, [
      { productId, quantity: 1 },
      { productId, quantity: 1 },
    ]);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId,
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 2, unitPrice: 10000 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ orderId: orderRequestId });

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()).toMatchObject({ stock: 3, orderCount: 1, unitsSold: 2 });

    const orderSnap = await adminDb.doc(`orders/${orderRequestId}`).get();
    expect(orderSnap.data()?.items).toEqual([
      expect.objectContaining({ productId, quantity: 2 }),
    ]);
  });

  it('si el precio cambio desde que se revisó, falla sin escribir y nombra el producto (F6.8)', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    await seedProduct(productId, { name: 'Monitor Halo', price: 10000, stock: 5 });
    await seedCart(uid, [{ productId, quantity: 1 }]);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId: randomUUID(),
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 1, unitPrice: 9000 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'PRICE_CHANGED', details: { productId } }),
    );

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()?.stock).toBe(5);
  });

  it('un producto retirado del catalogo no se puede comprar', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    await seedProduct(productId, { isActive: false });
    await seedCart(uid, [{ productId, quantity: 1 }]);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId: randomUUID(),
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 1, unitPrice: 10000 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'PRODUCT_UNAVAILABLE' }));
  });

  it('con el carrito vacio, rechaza con 400 antes de tocar la transaccion', async () => {
    const uid = randomUUID();
    await seedCart(uid, []);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId: randomUUID(),
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId: randomUUID(), quantity: 1, unitPrice: 1 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'EMPTY_CART' }));
  });

  it('si la cantidad real del carrito ya no coincide con lo revisado, pide revisar de nuevo', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    await seedProduct(productId, { stock: 5 });
    await seedCart(uid, [{ productId, quantity: 3 }]);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId: randomUUID(),
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 2, unitPrice: 10000 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'CART_CHANGED' }));
  });

  it('sin token valido, rechaza con 401 (F13, extendido a la compra)', async () => {
    mockVerifyRequestToken.mockResolvedValueOnce({ ok: false });

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId: randomUUID(),
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId: randomUUID(), quantity: 1, unitPrice: 1 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNAUTHENTICATED' }));
  });

  it('con un body mal formado, rechaza con 400', async () => {
    mockAuthenticatedAs(randomUUID());

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ shipping: SHIPPING }), res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_REQUEST' }));
  });

  it('con el pago simulado rechazado, nunca crea una orden (F6.9, defensa de servidor)', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    await seedProduct(productId);
    await seedCart(uid, [{ productId, quantity: 1 }]);
    mockAuthenticatedAs(uid);

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({
        orderRequestId: randomUUID(),
        shipping: SHIPPING,
        payment: PAYMENT_ERROR,
        expectedItems: [{ productId, quantity: 1, unitPrice: 10000 }],
      }),
      res,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_REQUEST' }));
  });

  it('reenviar la misma orderRequestId no descuenta el stock dos veces (idempotencia)', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    const orderRequestId = randomUUID();
    await seedProduct(productId, { stock: 5 });
    await seedCart(uid, [{ productId, quantity: 2 }]);
    mockAuthenticatedAs(uid);
    mockAuthenticatedAs(uid);

    const body = {
      orderRequestId,
      shipping: SHIPPING,
      payment: PAYMENT_SUCCESS,
      expectedItems: [{ productId, quantity: 2, unitPrice: 10000 }],
    };

    const first = buildResponse();
    await handler(buildRequest(body), first.res);
    expect(first.status).toHaveBeenCalledWith(200);

    const second = buildResponse();
    await handler(buildRequest(body), second.res);

    expect(second.status).toHaveBeenCalledWith(200);
    expect(second.json).toHaveBeenCalledWith({ orderId: orderRequestId });

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()?.stock).toBe(3);
  });

  it('reintentar con la misma orderRequestId tras un fallo de negocio si crea la orden', async () => {
    const uid = randomUUID();
    const productId = randomUUID();
    const orderRequestId = randomUUID();
    await seedProduct(productId, { price: 10000, stock: 5 });
    await seedCart(uid, [{ productId, quantity: 1 }]);
    mockAuthenticatedAs(uid);
    mockAuthenticatedAs(uid);

    const failing = buildResponse();
    await handler(
      buildRequest({
        orderRequestId,
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 1, unitPrice: 9000 }],
      }),
      failing.res,
    );
    expect(failing.status).toHaveBeenCalledWith(409);

    const retry = buildResponse();
    await handler(
      buildRequest({
        orderRequestId,
        shipping: SHIPPING,
        payment: PAYMENT_SUCCESS,
        expectedItems: [{ productId, quantity: 1, unitPrice: 10000 }],
      }),
      retry.res,
    );

    expect(retry.status).toHaveBeenCalledWith(200);
    expect(retry.json).toHaveBeenCalledWith({ orderId: orderRequestId });
  });

  it.skip('dos compras simultaneas de la ultima unidad: una gana, la otra falla, y el stock final es 0 (regla 11) — saltado: el emulador usa reintento optimista, no el locking pesimista por documento de Firestore real; ver CLAUDE.md', async () => {
    const productId = randomUUID();
    const uidA = randomUUID();
    const uidB = randomUUID();
    await seedProduct(productId, { stock: 1 });
    await seedCart(uidA, [{ productId, quantity: 1 }]);
    await seedCart(uidB, [{ productId, quantity: 1 }]);
    mockAuthenticatedAs(uidA);
    mockAuthenticatedAs(uidB);

    const resultA = buildResponse();
    const resultB = buildResponse();

    await Promise.all([
      handler(
        buildRequest({
          orderRequestId: randomUUID(),
          shipping: SHIPPING,
          payment: PAYMENT_SUCCESS,
          expectedItems: [{ productId, quantity: 1, unitPrice: 10000 }],
        }),
        resultA.res,
      ),
      handler(
        buildRequest({
          orderRequestId: randomUUID(),
          shipping: SHIPPING,
          payment: PAYMENT_SUCCESS,
          expectedItems: [{ productId, quantity: 1, unitPrice: 10000 }],
        }),
        resultB.res,
      ),
    ]);

    const statusCodes = [resultA.status.mock.calls[0]?.[0], resultB.status.mock.calls[0]?.[0]];
    expect(statusCodes.sort()).toEqual([200, 409]);

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()?.stock).toBe(0);
  });
});

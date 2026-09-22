import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Clave RSA generada localmente solo para que `cert()` pueda parsear un PEM
// valido al inicializar el Admin SDK en este test. Nunca sale del emulador:
// FIRESTORE_EMULATOR_HOST (seteado por `firebase emulators:exec`) hace que el
// SDK ignore la autenticacion real y hable directo con el emulador local.
process.env.FIREBASE_ADMIN_PROJECT_ID = 'clack-add2a';
process.env.FIREBASE_ADMIN_CLIENT_EMAIL = 'test@clack-add2a.iam.gserviceaccount.com';
process.env.FIREBASE_ADMIN_PRIVATE_KEY =
  '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCvz3oEb0NvAFXc\nWEJ5l5148U1pXZ7p175NgoWObdrRyi4gWVEJtXcaih2mA4QjuDUJPX6Whp67Dhdg\n4eK7/V/2l2IAwz4m4UlHSseeldi2e/0lkRKpyEdukJ7BOhH/2hzmYdgO8KbMElUN\nmYtM8X6HOjZzLJzX5gr8mLlcNWTSBQWQFxu6Mxndq13QIlHIuV79AuX9LVmrBcX4\nUaSs9/zHm7eugYWXPrke5R/TwxqeemVUPSB6sQ2uv1r/s0+qBQbeeM+7yjeNIevl\nF7Mob721rsB1px3pIgzB94qKb+94ncvbEA6aCXMJSc+GeQN0Nm1DuSdOo/M/WNZF\nAMkESaNBAgMBAAECggEAFwcN7FbGdluM43eL/XEmZxj0EsD4d5iSjIR0CdvJtYDN\n2d7ZBnSGTSuaBoyfWi5eg/9R/VVUpRuLZF0x3X2qfBoH9CGemmkXuAbLbrIh2IUU\n+z6tOx/Ie2rl4FlC0kg3UNWv/wT2U/Ryv31FCab3865kQ2GsiXrQJZW7caBsvDVE\njbmAa39uwUDaQ4R0HampwRgegYFCTHIHcnIpcf9bCh11DjGhidJNj6Z87pKbNpJy\nYt8qeahsuXn+gtX3N+nPt1tBild/dqKxKS55+3to17p6Vnsb7KN5bfv94DpZSqnU\nxUmBeukwgIZkxtVl4zTjf+FPDJmqeMUJkh0mUuHpgQKBgQDdI130MivWGXn6V7/6\ny6F/jM8T00v/1LQh3RNXO9JX3+h+P4usRB+nLebBn6nnq5p/F0LEmQVbrkUvjVkm\nV7SGXoUT2tejJi2wSbHjPv/G9vxMvCnWgKdDFMgBwnJ5QaCZvwA1oAaOhXwcni0t\nQaEq1UtoFBEyLjM6tf/8FQ8TBQKBgQDLhslu9RC9qXu4wLaSGB6SDha5x5dG0agh\nd8QIIPWJ5rsfUadc63Yr44MfTh4n8FHp5ZwylP+5lG/pNwzMk2rB1jsLKPgDZiyL\narzM/Y5foMZucne4Q/6LH8hZ5J0HXNSnR8YpfG/Szv1++powmki2erEPN3NJ8PPp\nmccM37a8DQKBgQCBN4RUB+kTjwl2nkXg75Ir7QSnqgUztX+Ydg0yIROVI5JACzO7\ncococirvozNt2xlJADeUl3HJE7j7w1V/kSo8hgivBGaSv+FcrINUrWBaS8I7uIud\n+slB6mfAl3W6ov2MOU6PBzYtm5RdSJRPaJUbaU1JwMgXkWV//g9ZppiLXQKBgQCz\nJFenD5QFrOlWjGHmo848tqPwMCsKTb4Uf0uP8BrPn8Ry47dRhXuFVAN1CZhnhRNE\nsjLTHu0cFviOKUNdyh/8r6lWwF/U9hkdOf0m3cN0jpo6WwzfpxGkuXvrC9vfwCj5\neKaGm539yu27167iOtrnq4SvpRoYKjs3EYDv5vX7/QKBgQDAf5nIFVelJBa+Fbln\nYxhLwTxK8x0nUueDmdnKV3iS2d7XiXPyYzMOADg20uJ8kuUBiiONRqMSgL056xnB\nXFj0fvS1sjuuV5SCiQdolsXLVuTtbytja+AMYbYiAflXlt5rAaI3kQtm81PSgLQI\nm4bm/jp5CYXest5Gh5JL7CUtZw==\n-----END PRIVATE KEY-----\n';

const mockVerifyRequestToken = vi.fn();
vi.mock('../../_lib/verifyRequestToken.js', () => ({ verifyRequestToken: mockVerifyRequestToken }));

const { default: handler } = await import('./update-status.js');
const { adminDb } = await import('../../_lib/firebaseAdmin.js');
const { Timestamp } = await import('firebase-admin/firestore');

const SHIPPING = {
  fullName: 'Hernán Albornoz',
  address: 'Av. Siempre Viva 742',
  city: 'Springfield',
  postalCode: '1000',
  phone: '1122334455',
};

const PAYMENT_SUCCESS = { cardholderName: 'Hernán Albornoz', method: 'card', outcome: 'success' };

async function seedProduct(id: string, overrides: Record<string, unknown> = {}): Promise<void> {
  await adminDb.doc(`products/${id}`).set({
    name: 'Teclado Aurora',
    nameLower: 'teclado aurora',
    description: 'Descripcion',
    price: 10000,
    stock: 3,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    isActive: true,
    specs: [{ label: 'Switches', value: 'Lineales' }],
    curatorialNote: 'Nota curatorial',
    ratingAverage: 0,
    ratingCount: 0,
    orderCount: 1,
    unitsSold: 2,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  });
}

type SeedOrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  imageUrl: string;
  quantity: number;
};

async function seedOrder(
  id: string,
  userId: string,
  items: SeedOrderItem[],
  overrides: Record<string, unknown> = {},
): Promise<void> {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  await adminDb.doc(`orders/${id}`).set({
    userId,
    items,
    subtotal,
    shippingCost: 4999,
    total: subtotal + 4999,
    status: 'pending',
    shipping: SHIPPING,
    payment: PAYMENT_SUCCESS,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ...overrides,
  });
}

function mockAuthenticatedAs(role: 'admin' | 'customer'): void {
  mockVerifyRequestToken.mockResolvedValueOnce({ ok: true, uid: randomUUID(), role });
}

function buildRequest(body: unknown): VercelRequest {
  return {
    method: 'POST',
    headers: { authorization: 'Bearer fake-token' },
    body,
  } as unknown as VercelRequest;
}

function buildResponse(): {
  res: VercelResponse;
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
} {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const res = { status, setHeader: vi.fn() } as unknown as VercelResponse;
  return { res, status, json };
}

describe('POST /api/admin/orders/update-status', () => {
  it('pending -> processing no toca stock ni contadores', async () => {
    const productId = randomUUID();
    const orderId = randomUUID();
    await seedProduct(productId, { stock: 3 });
    await seedOrder(orderId, randomUUID(), [
      {
        productId,
        name: 'Teclado Aurora',
        unitPrice: 10000,
        imageUrl: 'https://placehold.co/600x400',
        quantity: 1,
      },
    ]);
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ orderId, status: 'processing' }), res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ orderId, status: 'processing' });

    const orderSnap = await adminDb.doc(`orders/${orderId}`).get();
    expect(orderSnap.data()?.status).toBe('processing');

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()).toMatchObject({ stock: 3, orderCount: 1, unitsSold: 2 });
  });

  it('processing -> completed no toca stock ni contadores', async () => {
    const orderId = randomUUID();
    await seedOrder(
      orderId,
      randomUUID(),
      [
        {
          productId: randomUUID(),
          name: 'Teclado Aurora',
          unitPrice: 10000,
          imageUrl: 'https://placehold.co/600x400',
          quantity: 1,
        },
      ],
      { status: 'processing' },
    );
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ orderId, status: 'completed' }), res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ orderId, status: 'completed' });
  });

  it('pending -> cancelled restituye stock y decrementa orderCount/unitsSold (F11.5)', async () => {
    const productId = randomUUID();
    const orderId = randomUUID();
    await seedProduct(productId, { stock: 3 });
    await seedOrder(orderId, randomUUID(), [
      {
        productId,
        name: 'Teclado Aurora',
        unitPrice: 10000,
        imageUrl: 'https://placehold.co/600x400',
        quantity: 2,
      },
    ]);
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ orderId, status: 'cancelled' }), res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ orderId, status: 'cancelled' });

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()).toMatchObject({ stock: 5, orderCount: 0, unitsSold: 0 });
  });

  it('processing -> cancelled tambien restituye stock (F11.5)', async () => {
    const productId = randomUUID();
    const orderId = randomUUID();
    await seedProduct(productId, { stock: 3 });
    await seedOrder(
      orderId,
      randomUUID(),
      [
        {
          productId,
          name: 'Teclado Aurora',
          unitPrice: 10000,
          imageUrl: 'https://placehold.co/600x400',
          quantity: 1,
        },
      ],
      { status: 'processing' },
    );
    mockAuthenticatedAs('admin');

    const { res, status } = buildResponse();
    await handler(buildRequest({ orderId, status: 'cancelled' }), res);

    expect(status).toHaveBeenCalledWith(200);
    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()).toMatchObject({ stock: 4, orderCount: 0, unitsSold: 1 });
  });

  it.each([
    ['completed', 'processing'],
    ['completed', 'cancelled'],
    ['cancelled', 'processing'],
    ['cancelled', 'completed'],
    ['pending', 'completed'],
  ])(
    'rechaza la transicion de %s a %s, prohibida por el grafo (F11.3, F11.4)',
    async (from, to) => {
      const orderId = randomUUID();
      await seedOrder(
        orderId,
        randomUUID(),
        [
          {
            productId: randomUUID(),
            name: 'Teclado Aurora',
            unitPrice: 10000,
            imageUrl: 'https://placehold.co/600x400',
            quantity: 1,
          },
        ],
        { status: from },
      );
      mockAuthenticatedAs('admin');

      const { res, status, json } = buildResponse();
      await handler(buildRequest({ orderId, status: to }), res);

      expect(status).toHaveBeenCalledWith(409);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'INVALID_STATUS_TRANSITION' }),
      );
    },
  );

  it('cancelar dos veces la misma orden no devuelve el stock dos veces (F11.6)', async () => {
    const productId = randomUUID();
    const orderId = randomUUID();
    await seedProduct(productId, { stock: 3 });
    await seedOrder(orderId, randomUUID(), [
      {
        productId,
        name: 'Teclado Aurora',
        unitPrice: 10000,
        imageUrl: 'https://placehold.co/600x400',
        quantity: 1,
      },
    ]);
    mockAuthenticatedAs('admin');
    mockAuthenticatedAs('admin');

    const first = buildResponse();
    await handler(buildRequest({ orderId, status: 'cancelled' }), first.res);
    expect(first.status).toHaveBeenCalledWith(200);

    const second = buildResponse();
    await handler(buildRequest({ orderId, status: 'cancelled' }), second.res);
    expect(second.status).toHaveBeenCalledWith(409);
    expect(second.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INVALID_STATUS_TRANSITION' }),
    );

    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()).toMatchObject({ stock: 4, orderCount: 0, unitsSold: 1 });
  });

  it('si el producto ya no existe, igual cancela la orden sin restituir ese item', async () => {
    const deletedProductId = randomUUID();
    const orderId = randomUUID();
    await seedOrder(orderId, randomUUID(), [
      {
        productId: deletedProductId,
        name: 'Producto borrado',
        unitPrice: 10000,
        imageUrl: 'https://placehold.co/600x400',
        quantity: 1,
      },
    ]);
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ orderId, status: 'cancelled' }), res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ orderId, status: 'cancelled' });

    const orderSnap = await adminDb.doc(`orders/${orderId}`).get();
    expect(orderSnap.data()?.status).toBe('cancelled');
  });

  it('un customer no puede cambiar el estado de una orden (403 FORBIDDEN)', async () => {
    const orderId = randomUUID();
    await seedOrder(orderId, randomUUID(), [
      {
        productId: randomUUID(),
        name: 'Teclado Aurora',
        unitPrice: 10000,
        imageUrl: 'https://placehold.co/600x400',
        quantity: 1,
      },
    ]);
    mockAuthenticatedAs('customer');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ orderId, status: 'processing' }), res);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'FORBIDDEN' }));
  });

  it('sin token valido, rechaza con 401', async () => {
    mockVerifyRequestToken.mockResolvedValueOnce({ ok: false });

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ orderId: randomUUID(), status: 'processing' }), res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNAUTHENTICATED' }));
  });

  it('una orden que no existe rechaza con 404 ORDER_NOT_FOUND', async () => {
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ orderId: randomUUID(), status: 'processing' }), res);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'ORDER_NOT_FOUND' }));
  });

  it('con un body mal formado, rechaza con 400', async () => {
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({}), res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_REQUEST' }));
  });

  it('un orderId que no es un uuid se rechaza con 400 en vez de resolverse como un path de Firestore distinto', async () => {
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest({ orderId: `${randomUUID()}/subcollection/otro-doc`, status: 'processing' }),
      res,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_REQUEST' }));
  });
});

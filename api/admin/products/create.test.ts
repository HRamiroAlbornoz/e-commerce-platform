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

const { default: handler } = await import('./create.js');
const { adminDb } = await import('../../_lib/firebaseAdmin.js');

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

function validProductBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Teclado Aurora',
    description: 'Descripcion',
    price: 89999.999,
    stock: 40,
    category: 'keyboard',
    displayColor: 'lime',
    imageUrl: 'https://placehold.co/600x400',
    specs: [{ label: 'Switches', value: 'Lineales' }],
    curatorialNote: 'Nota curatorial',
    ...overrides,
  };
}

describe('POST /api/admin/products/create', () => {
  it('un admin crea un producto con los defaults correctos del servidor', async () => {
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest(validProductBody()), res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ productId: expect.any(String) });

    const productId = (json.mock.calls[0]?.[0] as { productId: string }).productId;
    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()).toMatchObject({
      name: 'Teclado Aurora',
      nameLower: 'teclado aurora',
      price: 90000,
      isActive: true,
      ratingAverage: 0,
      ratingCount: 0,
      orderCount: 0,
      unitsSold: 0,
    });
  });

  it('un customer no puede crear productos (403 FORBIDDEN)', async () => {
    mockAuthenticatedAs('customer');

    const { res, status, json } = buildResponse();
    await handler(buildRequest(validProductBody()), res);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'FORBIDDEN' }));
  });

  it('sin token valido, rechaza con 401', async () => {
    mockVerifyRequestToken.mockResolvedValueOnce({ ok: false });

    const { res, status, json } = buildResponse();
    await handler(buildRequest(validProductBody()), res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNAUTHENTICATED' }));
  });

  it('sin specs (viola el minimo de 1), rechaza con 400', async () => {
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest(validProductBody({ specs: [] })), res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_REQUEST' }));
  });

  it('con isActive u otros campos derivados en el body, los ignora y usa los defaults del servidor', async () => {
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(
      buildRequest(validProductBody({ isActive: false, ratingAverage: 5, orderCount: 99 })),
      res,
    );

    expect(status).toHaveBeenCalledWith(200);
    const productId = (json.mock.calls[0]?.[0] as { productId: string }).productId;
    const productSnap = await adminDb.doc(`products/${productId}`).get();
    expect(productSnap.data()).toMatchObject({ isActive: true, ratingAverage: 0, orderCount: 0 });
  });
});

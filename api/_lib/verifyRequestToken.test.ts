import { describe, expect, it, vi } from 'vitest';
import type { VercelRequest } from '@vercel/node';

const { verifyIdToken } = vi.hoisted(() => ({ verifyIdToken: vi.fn() }));

vi.mock('./firebaseAdmin.js', () => ({ adminAuth: { verifyIdToken } }));

const { verifyRequestToken } = await import('./verifyRequestToken.js');

function buildRequest(authorization?: string): VercelRequest {
  return { headers: authorization ? { authorization } : {} } as unknown as VercelRequest;
}

describe('verifyRequestToken', () => {
  it('sin header Authorization, devuelve ok:false sin llamar al SDK', async () => {
    const result = await verifyRequestToken(buildRequest());

    expect(result).toEqual({ ok: false });
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('con un token valido sin claim de rol, devuelve ok:true con role:customer', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'user-1' });

    const result = await verifyRequestToken(buildRequest('Bearer real-token'));

    expect(verifyIdToken).toHaveBeenCalledWith('real-token', true);
    expect(result).toEqual({ ok: true, uid: 'user-1', role: 'customer' });
  });

  it('con un token con claim role:admin, devuelve ok:true con role:admin', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'admin-1', role: 'admin' });

    const result = await verifyRequestToken(buildRequest('Bearer admin-token'));

    expect(result).toEqual({ ok: true, uid: 'admin-1', role: 'admin' });
  });

  it('con un claim de rol desconocido, devuelve role:customer como default seguro', async () => {
    verifyIdToken.mockResolvedValueOnce({ uid: 'user-2', role: 'superuser' });

    const result = await verifyRequestToken(buildRequest('Bearer weird-token'));

    expect(result).toEqual({ ok: true, uid: 'user-2', role: 'customer' });
  });

  it('con un token invalido o expirado, devuelve ok:false', async () => {
    verifyIdToken.mockRejectedValueOnce(new Error('auth/id-token-expired'));

    const result = await verifyRequestToken(buildRequest('Bearer expired-token'));

    expect(result).toEqual({ ok: false });
  });
});

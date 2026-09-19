import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mockVerifyRequestToken = vi.fn();
vi.mock('./verifyRequestToken.js', () => ({ verifyRequestToken: mockVerifyRequestToken }));

const { requireAdmin } = await import('./requireAdmin.js');

type FakeError = { code: string; message: string };

function buildRequest(method: string): VercelRequest {
  return { method, headers: { authorization: 'Bearer fake-token' } } as unknown as VercelRequest;
}

function buildResponse(): { res: VercelResponse; setHeader: ReturnType<typeof vi.fn> } {
  const setHeader = vi.fn();
  const res = { setHeader } as unknown as VercelResponse;
  return { res, setHeader };
}

function makeError(code: string, message: string): FakeError {
  return { code, message };
}

describe('requireAdmin', () => {
  it('con un metodo distinto de POST, responde INVALID_REQUEST y fija el header Allow', async () => {
    const { res, setHeader } = buildResponse();
    const respond = vi.fn();

    const result = await requireAdmin(buildRequest('GET'), res, 'req-1', makeError, respond);

    expect(result).toBeNull();
    expect(setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(respond).toHaveBeenCalledWith(res, 'req-1', {
      code: 'INVALID_REQUEST',
      message: expect.any(String),
    });
    expect(mockVerifyRequestToken).not.toHaveBeenCalled();
  });

  it('sin token valido, responde UNAUTHENTICATED', async () => {
    mockVerifyRequestToken.mockResolvedValueOnce({ ok: false });
    const { res } = buildResponse();
    const respond = vi.fn();

    const result = await requireAdmin(buildRequest('POST'), res, 'req-2', makeError, respond);

    expect(result).toBeNull();
    expect(respond).toHaveBeenCalledWith(res, 'req-2', {
      code: 'UNAUTHENTICATED',
      message: expect.any(String),
    });
  });

  it('con un customer autenticado, responde FORBIDDEN', async () => {
    mockVerifyRequestToken.mockResolvedValueOnce({ ok: true, uid: randomUUID(), role: 'customer' });
    const { res } = buildResponse();
    const respond = vi.fn();

    const result = await requireAdmin(buildRequest('POST'), res, 'req-3', makeError, respond);

    expect(result).toBeNull();
    expect(respond).toHaveBeenCalledWith(res, 'req-3', {
      code: 'FORBIDDEN',
      message: expect.any(String),
    });
  });

  it('con un admin autenticado, devuelve el uid sin responder ningun error', async () => {
    const uid = randomUUID();
    mockVerifyRequestToken.mockResolvedValueOnce({ ok: true, uid, role: 'admin' });
    const { res } = buildResponse();
    const respond = vi.fn();

    const result = await requireAdmin(buildRequest('POST'), res, 'req-4', makeError, respond);

    expect(result).toEqual({ uid });
    expect(respond).not.toHaveBeenCalled();
  });
});

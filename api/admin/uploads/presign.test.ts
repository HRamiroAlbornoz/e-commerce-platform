import { randomUUID } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const mockVerifyRequestToken = vi.fn();
vi.mock('../../_lib/verifyRequestToken.js', () => ({ verifyRequestToken: mockVerifyRequestToken }));

vi.mock('../../_lib/s3Client.js', () => ({ s3Client: {} }));

const mockGetSignedUrl = vi.fn();
vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl: mockGetSignedUrl }));

vi.mock('../../_lib/s3Env.js', () => ({
  s3Env: { S3_REGION: 'us-east-1', S3_BUCKET: 'clack-test-bucket' },
}));

const { default: handler } = await import('./presign.js');

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

describe('POST /api/admin/uploads/presign', () => {
  it('un admin pide una URL para un jpeg valido y recibe uploadUrl + publicUrl', async () => {
    mockAuthenticatedAs('admin');
    mockGetSignedUrl.mockResolvedValueOnce(
      'https://clack-test-bucket.s3.us-east-1.amazonaws.com/signed',
    );

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ contentType: 'image/jpeg', fileSize: 1_000_000 }), res);

    expect(status).toHaveBeenCalledWith(200);
    const body = json.mock.calls[0]?.[0] as { uploadUrl: string; publicUrl: string };
    expect(body.uploadUrl).toBe('https://clack-test-bucket.s3.us-east-1.amazonaws.com/signed');
    expect(body.publicUrl).toMatch(
      /^https:\/\/clack-test-bucket\.s3\.us-east-1\.amazonaws\.com\/products\/.+\.jpg$/,
    );
  });

  it('un customer no puede pedir una URL de subida (403 FORBIDDEN)', async () => {
    mockAuthenticatedAs('customer');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ contentType: 'image/jpeg', fileSize: 1000 }), res);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'FORBIDDEN' }));
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
  });

  it('sin token valido, rechaza con 401', async () => {
    mockVerifyRequestToken.mockResolvedValueOnce({ ok: false });

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ contentType: 'image/jpeg', fileSize: 1000 }), res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'UNAUTHENTICATED' }));
  });

  it('con un tipo de archivo fuera de la whitelist (ej. svg), rechaza con 400', async () => {
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ contentType: 'image/svg+xml', fileSize: 1000 }), res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_REQUEST' }));
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
  });

  it('con un archivo que supera el maximo, rechaza con 400', async () => {
    mockAuthenticatedAs('admin');

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ contentType: 'image/jpeg', fileSize: 6 * 1024 * 1024 }), res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INVALID_REQUEST' }));
    expect(mockGetSignedUrl).not.toHaveBeenCalled();
  });

  it('si la firma de la URL falla, responde 500 INTERNAL_ERROR', async () => {
    mockAuthenticatedAs('admin');
    mockGetSignedUrl.mockRejectedValueOnce(new Error('boom'));

    const { res, status, json } = buildResponse();
    await handler(buildRequest({ contentType: 'image/png', fileSize: 1000 }), res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INTERNAL_ERROR' }));
  });
});

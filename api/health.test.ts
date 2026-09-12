import { describe, expect, it, vi } from 'vitest';
import type { VercelResponse } from '@vercel/node';
import handler from './health.js';

describe('GET /api/health', () => {
  it('responde 200 con { ok: true }', () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = { status } as unknown as VercelResponse;
    const req = {} as unknown as Parameters<typeof handler>[0];

    handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ ok: true });
  });
});

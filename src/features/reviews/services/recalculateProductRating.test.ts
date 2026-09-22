import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from 'firebase/auth';
import { recalculateProductRating } from '@/features/reviews/services/recalculateProductRating';

vi.mock('firebase/auth', () => ({ getIdToken: vi.fn().mockResolvedValue('fake-id-token') }));

const fakeUser = {} as User;

function mockFetchResponse(status: number, body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

describe('recalculateProductRating', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('envia el token y el productId correctos a /api/reviews/recalculate', async () => {
    mockFetchResponse(200, { productId: 'product-1', ratingAverage: 4.5, ratingCount: 2 });

    await recalculateProductRating(fakeUser, 'product-1');

    expect(fetch).toHaveBeenCalledWith('/api/reviews/recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer fake-id-token' },
      body: JSON.stringify({ productId: 'product-1' }),
    });
  });

  it('con una respuesta exitosa, no lanza ni loguea nada', async () => {
    mockFetchResponse(200, { productId: 'product-1', ratingAverage: 4.5, ratingCount: 2 });

    await expect(recalculateProductRating(fakeUser, 'product-1')).resolves.toBeUndefined();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('si el servidor rechaza, no lanza al que llama, solo loguea (F8.7)', async () => {
    mockFetchResponse(500, {
      code: 'INTERNAL_ERROR',
      message: 'No pudimos actualizar el promedio del producto.',
    });

    await expect(recalculateProductRating(fakeUser, 'product-1')).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });

  it('si la red falla, no lanza al que llama, solo loguea (F8.7)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await expect(recalculateProductRating(fakeUser, 'product-1')).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalled();
  });
});
